"use client"

import * as React from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatBot() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-favor.jpeg" alt="Favor" className="h-8 w-8 rounded-full object-contain bg-white" />
              <div>
                <p className="font-bold text-sm">Assistant Favor</p>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                  En ligne
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-6 h-64 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground italic">
              Le ChatBot intelligent sera disponible très bientôt pour répondre à toutes vos questions immobilières.
            </p>
          </div>
          <div className="p-4 border-t border-border bg-muted/30">
             <div className="h-10 bg-white dark:bg-zinc-800 rounded-full border border-border px-4 flex items-center text-xs text-muted-foreground">
               Bientôt disponible...
             </div>
          </div>
        </div>
      )}
      
      <Button 
        size="icon" 
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? "rotate-90 scale-90" : "hover:scale-110"}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le Chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
