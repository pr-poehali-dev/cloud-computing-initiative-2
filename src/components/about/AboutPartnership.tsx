import { useState } from "react"
import { toast } from "sonner"
import { useRequests } from "@/contexts/RequestsContext"
import PartnershipPartners from "@/components/about/partnership/PartnershipPartners"
import PartnershipPerksDialog from "@/components/about/partnership/PartnershipPerksDialog"
import PartnershipFormDialog from "@/components/about/partnership/PartnershipFormDialog"
import {
  EMPTY_PARTNER_FORM,
  type PartnerFormState,
} from "@/components/about/partnership/partnershipData"

export default function AboutPartnership() {
  const [perksOpen, setPerksOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM)
  const [submitting, setSubmitting] = useState(false)
  const { addPartnerRequest } = useRequests()

  const update = <K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.contactName || !form.phone) {
      toast.error("Заполни компанию, имя и телефон — этого достаточно")
      return
    }
    setSubmitting(true)
    try {
      addPartnerRequest({ ...form })
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Заявка отправлена! Администратор свяжется в течение 1–2 дней.")
      setForm(EMPTY_PARTNER_FORM)
      setFormOpen(false)
      setPerksOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PartnershipPartners onOpenPerks={() => setPerksOpen(true)} />

      <PartnershipPerksDialog
        open={perksOpen}
        onOpenChange={setPerksOpen}
        onApply={() => {
          setPerksOpen(false)
          setTimeout(() => setFormOpen(true), 150)
        }}
      />

      <PartnershipFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        onChange={update}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  )
}
