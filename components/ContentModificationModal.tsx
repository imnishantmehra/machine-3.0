import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ContentModificationModalProps {
  isOpen: boolean
  onClose: () => void
  onRegenerate: (modifications: string) => void
  contentType: 'content' | 'image' | 'main' | 'sub'
}

export function ContentModificationModal({
  isOpen,
  onClose,
  onRegenerate,
  contentType
}: ContentModificationModalProps) {
  const [modifications, setModifications] = useState('')

  const handleRegenerate = () => {
    onRegenerate(modifications)
    setModifications('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modify {contentType === 'main' ? 'Main Idea' : contentType === 'sub' ? 'Sub-topic' : contentType === 'content' ? 'Content' : 'Image'}</DialogTitle>
          <DialogDescription>
            Describe the modifications you'd like to make to the {contentType === 'main' ? 'main idea' : contentType === 'sub' ? 'sub-topic' : contentType}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="modifications"
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            placeholder={`Enter your desired modifications for the ${contentType === 'main' ? 'main idea' : contentType === 'sub' ? 'sub-topic' : contentType}...`}
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleRegenerate}>
            Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
