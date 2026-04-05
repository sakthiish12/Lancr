'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Create Organisation ───────────────────────────────────────────────────────

export async function createOrgAction(data: { name: string; slug: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const svc = serviceClient()

  // Validate slug uniqueness
  const { data: existing } = await svc.from('organizations').select('id').eq('slug', data.slug).single()
  if (existing) return { error: 'That URL slug is already taken. Try a different one.' }

  // Create org
  const { data: org, error: orgErr } = await svc.from('organizations').insert({
    name: data.name,
    slug: data.slug,
  }).select().single()

  if (orgErr || !org) return { error: orgErr?.message ?? 'Failed to create organization' }

  // Add creator as admin member
  const { error: memErr } = await svc.from('org_memberships').insert({
    org_id: org.id,
    tenant_id: user.id,
    role: 'admin',
    status: 'active',
    joined_at: new Date().toISOString(),
  })

  if (memErr) return { error: memErr.message }

  revalidatePath('/org')
  return { success: true, slug: org.slug }
}

// ─── Invite Member ─────────────────────────────────────────────────────────────

export async function inviteMemberAction(orgId: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const svc = serviceClient()

  // Verify caller is admin of this org
  const { data: membership } = await svc.from('org_memberships')
    .select('role').eq('org_id', orgId).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership || membership.role !== 'admin') return { error: 'Not authorized' }

  // Check seat limit
  const { count } = await svc.from('org_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId).eq('status', 'active')
  const { data: org } = await svc.from('organizations').select('seats_limit, name').eq('id', orgId).single()
  if (org && count !== null && count >= org.seats_limit) {
    return { error: `Seat limit reached (${org.seats_limit}). Upgrade to add more members.` }
  }

  // Check if already invited/member
  const { data: existingInvite } = await svc.from('org_memberships')
    .select('id, status').eq('org_id', orgId).eq('invite_email', email).single()
  if (existingInvite) {
    if (existingInvite.status === 'active') return { error: 'This person is already a member.' }
    return { error: 'Invite already sent to this email.' }
  }

  // Generate token
  const token = crypto.randomUUID()

  const { error: invErr } = await svc.from('org_memberships').insert({
    org_id: orgId,
    invite_email: email,
    invite_token: token,
    role: 'member',
    status: 'pending',
  })
  if (invErr) return { error: invErr.message }

  // Send invite email
  const inviteUrl = `${APP_URL}/accept-invite/${token}`
  await resend.emails.send({
    from: 'Lancr <noreply@lancr.app>',
    to: email,
    subject: `You're invited to join ${org?.name ?? 'a team'} on Lancr`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>You've been invited to ${org?.name ?? 'a team'} on Lancr</h2>
        <p>You've been invited to join as a freelancer member. Click the button below to accept.</p>
        <a href="${inviteUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Accept Invitation →
        </a>
        <p style="color:#6b7280;font-size:12px;">This invite link expires in 7 days. If you didn't expect this email, you can ignore it.</p>
      </div>
    `,
  }).catch(() => {/* ignore email errors */})

  revalidatePath(`/org/${org?.name}`)
  return { success: true }
}

// ─── Remove Member ─────────────────────────────────────────────────────────────

export async function removeMemberAction(orgId: string, membershipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const svc = serviceClient()

  // Verify caller is admin
  const { data: membership } = await svc.from('org_memberships')
    .select('role').eq('org_id', orgId).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership || membership.role !== 'admin') return { error: 'Not authorized' }

  await svc.from('org_memberships').delete().eq('id', membershipId)
  revalidatePath(`/org`)
  return { success: true }
}

// ─── Accept Invite ─────────────────────────────────────────────────────────────

export async function acceptInviteAction(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Please sign in first to accept your invitation.' }

  const svc = serviceClient()

  const { data: invite } = await svc.from('org_memberships')
    .select('*, organization:organizations(slug)').eq('invite_token', token).single()

  if (!invite) return { error: 'This invite link is invalid or has expired.' }
  if (invite.status === 'active') return { error: 'This invite has already been used.' }

  const { error } = await svc.from('org_memberships').update({
    tenant_id: user.id,
    status: 'active',
    joined_at: new Date().toISOString(),
    invite_token: null,
  }).eq('id', invite.id)

  if (error) return { error: error.message }

  const org = invite.organization as { slug: string } | null
  return { success: true, slug: org?.slug }
}

// ─── Update Org Branding ───────────────────────────────────────────────────────

export async function updateOrgBrandingAction(orgId: string, data: { name?: string; branding?: Record<string, string> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const svc = serviceClient()
  const { data: membership } = await svc.from('org_memberships')
    .select('role').eq('org_id', orgId).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership || membership.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await svc.from('organizations').update({
    ...( data.name ? { name: data.name } : {} ),
    ...( data.branding ? { branding: data.branding } : {} ),
    updated_at: new Date().toISOString(),
  }).eq('id', orgId)

  if (error) return { error: error.message }
  revalidatePath('/org')
  return { success: true }
}
