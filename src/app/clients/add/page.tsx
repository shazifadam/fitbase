"use client"

import { useRouter } from "next/navigation"
import AddClientForm from "@/components/clients/AddClientForm"

export default function AddClientPage() {
  const router = useRouter()

  return (
    <AddClientForm onClose={() => router.push('/clients')} />
  )
}
