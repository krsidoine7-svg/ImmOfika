'use server'

import { 
  uploadContractTemplateAction, 
  setDefaultContractTemplateAction, 
  deleteContractTemplateAction 
} from "@/app/actions/contractTemplates"

export async function creerTemplateAction(formData: FormData) {
  return uploadContractTemplateAction(formData)
}

export async function definirTemplateParDefautAction(templateId: string) {
  return setDefaultContractTemplateAction(templateId)
}

export async function supprimerTemplateAction(templateId: string) {
  return deleteContractTemplateAction(templateId)
}
