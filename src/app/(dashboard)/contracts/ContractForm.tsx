'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Shield, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { CONTRACT_TEMPLATES } from '@/lib/contracts/templates'
import { createContractAction } from '../actions'
import type { Client } from '@/types'

interface Props {
  clients: Client[]
  businessName: string
}

type TemplateKey = keyof typeof CONTRACT_TEMPLATES

const TEMPLATE_ICONS: Record<TemplateKey, React.ReactNode> = {
  service_agreement: <FileText className="h-6 w-6 text-violet-600" />,
  nda: <Shield className="h-6 w-6 text-violet-600" />,
  retainer: <RefreshCw className="h-6 w-6 text-violet-600" />,
}

function applyPlaceholders(content: string, vars: Record<string, string>) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function ContractForm({ clients, businessName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'template' | 'editor'>('template')

  // Step 1 state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null)
  const [selectedClientId, setSelectedClientId] = useState('')

  // Step 2 state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const selectedClient = clients.find(c => c.id === selectedClientId)

  function handleTemplateSelect(key: TemplateKey) {
    setSelectedTemplate(key)
  }

  function handleContinue() {
    if (!selectedTemplate || !selectedClientId) return

    const template = CONTRACT_TEMPLATES[selectedTemplate]
    const today = new Date().toLocaleDateString('en-SG', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const filled = applyPlaceholders(template.content, {
      date: today,
      business_name: businessName,
      client_name: selectedClient?.name ?? '',
      services_description: '[Describe the services to be provided]',
    })

    setTitle(`${template.label} — ${selectedClient?.name ?? ''}`)
    setContent(filled)
    setStep('editor')
  }

  function handleSubmit() {
    if (!selectedTemplate || !selectedClientId || !title || !content) return

    startTransition(async () => {
      const result = await createContractAction({
        client_id: selectedClientId,
        template_type: selectedTemplate,
        title,
        content,
      })

      if ('error' in result) {
        alert(result.error)
      } else if ('id' in result && result.id) {
        router.push(`/contracts/${result.id}`)
      }
    })
  }

  if (step === 'template') {
    return (
      <div className="space-y-6">
        {/* Client selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          {clients.length === 0 ? (
            <p className="text-sm text-gray-500">
              No clients yet.{' '}
              <a href="/clients/new" className="text-violet-600 hover:underline">
                Add a client first
              </a>
            </p>
          ) : (
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Template cards */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Template <span className="text-red-500">*</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(CONTRACT_TEMPLATES) as TemplateKey[]).map(key => {
              const tmpl = CONTRACT_TEMPLATES[key]
              const isSelected = selectedTemplate === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateSelect(key)}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <div className="mb-3">{TEMPLATE_ICONS[key]}</div>
                  <p className="text-sm font-semibold text-gray-900">{tmpl.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{tmpl.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate || !selectedClientId}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: editor
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Content</label>
        <p className="text-xs text-gray-500 mb-2">
          Review and edit the pre-filled contract. Replace any remaining placeholders in brackets.
        </p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={30}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('template')}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} loading={isPending} disabled={!title || !content}>
          Save Contract
        </Button>
      </div>
    </div>
  )
}
