import { z } from 'zod'

export const workspaceViewSchema = z.enum(['author', 'runs', 'library'])

export const chatRoleSchema = z.enum(['user', 'agent'])

export const chatDetailSchema = z.object({
  label: z.string(),
  value: z.string()
})

export const chatMessageSchema = z.object({
  id: z.string(),
  role: chatRoleSchema,
  text: z.string(),
  details: z.array(chatDetailSchema)
})

export type WorkspaceView = z.infer<typeof workspaceViewSchema>
export type ChatRole = z.infer<typeof chatRoleSchema>
export type ChatDetail = z.infer<typeof chatDetailSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
