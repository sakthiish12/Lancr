export type ContractTemplateKey = 'service_agreement' | 'nda' | 'retainer'

export const CONTRACT_TEMPLATES: Record<
  ContractTemplateKey,
  { label: string; description: string; content: string }
> = {
  service_agreement: {
    label: 'Service Agreement',
    description: 'Standard freelance service contract covering scope, payment and IP',
    content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{date}} between {{business_name}} ("Service Provider") and {{client_name}} ("Client").

1. SERVICES
The Service Provider agrees to provide the following services:
{{services_description}}

2. PAYMENT TERMS
The Client agrees to pay for the services described above. Payment is due within 30 days of invoice. Late payments will incur interest at 1.5% per month.

3. TIMELINE
Work shall commence upon written confirmation and be completed by the agreed deadline. Any changes to scope may affect the timeline and will be communicated in advance.

4. INTELLECTUAL PROPERTY
Upon receipt of full payment, all work product created under this Agreement shall become the exclusive property of the Client. The Service Provider retains the right to display the work in their portfolio unless otherwise agreed in writing.

5. CONFIDENTIALITY
Both parties agree to keep confidential any proprietary information, trade secrets, or business data shared during this engagement, and not to disclose such information to any third party without prior written consent.

6. REVISIONS
This Agreement includes up to three (3) rounds of revisions. Additional revisions will be billed at the Service Provider's standard hourly rate.

7. TERMINATION
Either party may terminate this Agreement with 14 days written notice. The Client shall pay for all work completed and expenses incurred up to the termination date.

8. LIMITATION OF LIABILITY
The Service Provider's total liability shall not exceed the total fees paid under this Agreement in the three months preceding the claim.

9. INDEPENDENT CONTRACTOR
The Service Provider is an independent contractor and not an employee of the Client. The Service Provider is responsible for their own taxes and insurance.

10. GOVERNING LAW
This Agreement shall be governed by the laws of Singapore. Any disputes shall be subject to the exclusive jurisdiction of the Singapore courts.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Service Provider: {{business_name}}
Client: {{client_name}}
`,
  },
  nda: {
    label: 'Non-Disclosure Agreement',
    description: 'Mutual confidentiality agreement to protect sensitive information',
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}} between {{business_name}} ("Disclosing Party") and {{client_name}} ("Receiving Party").

WHEREAS, the parties wish to explore a potential business relationship and may share confidential information with each other for evaluation purposes;

NOW, THEREFORE, in consideration of the mutual promises contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other, either directly or indirectly, in writing, orally or by inspection of tangible objects, that is designated as "Confidential," "Proprietary," or by some similar designation, or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure. This includes, without limitation, business plans, technical data, product plans, customer lists, financial information, and marketing strategies.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
(a) Hold all Confidential Information in strict confidence using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care;
(b) Not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party;
(c) Use Confidential Information solely for the purpose of evaluating the potential business relationship between the parties;
(d) Limit access to Confidential Information to those employees, contractors, or agents who need to know such information and who are bound by confidentiality obligations at least as protective as those in this Agreement.

3. EXCLUSIONS
The obligations of this Agreement do not apply to information that:
(a) Is or becomes publicly available through no fault of the Receiving Party;
(b) Was rightfully known to the Receiving Party before receipt from the Disclosing Party;
(c) Is independently developed by the Receiving Party without use of Confidential Information;
(d) Is required to be disclosed by applicable law or court order, provided that the Receiving Party gives the Disclosing Party reasonable prior written notice.

4. RETURN OF INFORMATION
Upon request by the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.

5. TERM
This Agreement shall remain in effect for two (2) years from the date of signing. The obligations with respect to Confidential Information that constitutes trade secrets shall survive indefinitely.

6. REMEDIES
The parties acknowledge that any breach of this Agreement may cause irreparable harm for which monetary damages would be inadequate, and that the Disclosing Party shall be entitled to seek injunctive relief in addition to all other remedies.

7. GOVERNING LAW
This Agreement shall be governed by the laws of Singapore.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Disclosing Party: {{business_name}}
Receiving Party: {{client_name}}
`,
  },
  retainer: {
    label: 'Retainer Agreement',
    description: 'Ongoing monthly retainer for continuous services',
    content: `RETAINER AGREEMENT

This Retainer Agreement ("Agreement") is entered into as of {{date}} between {{business_name}} ("Service Provider") and {{client_name}} ("Client").

1. RETAINER SERVICES
The Service Provider shall make available services to the Client on a monthly retainer basis. The specific services to be provided include:
{{services_description}}

2. RETAINER FEE
The Client shall pay a monthly retainer fee as invoiced by the Service Provider, payable on the 1st of each month. The retainer fee covers up to the agreed number of hours per month.

3. UNUSED HOURS
Unused hours in any given month do not roll over to the following month unless otherwise agreed in writing by both parties.

4. ADDITIONAL WORK
Work required beyond the scope of the retainer shall be discussed and agreed upon in advance. Additional work will be billed at the Service Provider's standard rate.

5. PRIORITY ACCESS
As a retainer client, the Client shall receive priority scheduling and a dedicated response time of one (1) business day for all communications.

6. INVOICING
The Service Provider shall invoice the Client on the 1st of each month. Payment is due within 14 days of invoice date. Late payments incur interest at 1.5% per month.

7. TERM AND RENEWAL
This Agreement begins on the date of signing and continues on a month-to-month basis. It automatically renews each month unless terminated as provided in Section 8.

8. TERMINATION
Either party may terminate this Agreement by providing 30 days written notice. The Client shall pay all outstanding invoices and fees for work completed through the termination date.

9. INTELLECTUAL PROPERTY
Upon receipt of payment for each month, the Service Provider grants the Client ownership of all deliverables produced during that month.

10. CONFIDENTIALITY
The Service Provider agrees to maintain the confidentiality of all Client information and not to disclose it to any third party without prior written consent.

11. GOVERNING LAW
This Agreement shall be governed by the laws of Singapore.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Service Provider: {{business_name}}
Client: {{client_name}}
`,
  },
}
