"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface TrendingOnXProps {
  onAddToQueue: (items: Array<{ id: string; type: string; name: string; source: string }>) => void
}

export function TrendingOnX({ onAddToQueue }: TrendingOnXProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Default trending topics
  const trendingTopics = [
    { id: "x-1", name: "#ContentMarketing", engagement: "125K tweets", relevance: 92 },
    { id: "x-2", name: "#DigitalStrategy", engagement: "87K tweets", relevance: 88 },
    { id: "x-3", name: "#MarketingAutomation", engagement: "63K tweets", relevance: 76 },
    { id: "x-4", name: "#BrandAwareness", engagement: "112K tweets", relevance: 85 },
    { id: "x-5", name: "#SocialMediaROI", engagement: "94K tweets", relevance: 79 },
  ]

  const handleSearch = () => {
    // In a real app, this would search for trending topics
    console.log("Searching for:", searchQuery)
  }

  const handleCheckboxChange = (topicId: string) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  const handleAddToQueue = () => {
    const selectedItems = trendingTopics
      .filter((topic) => selectedTopics.includes(topic.id))
      .map((topic) => ({
        id: topic.id,
        type: "hashtag",
        name: topic.name,
        source: "X Trending",
      }))

    if (selectedItems.length > 0) {
      onAddToQueue(selectedItems)
      setSelectedTopics([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search trending topics on X..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Trending on X</h3>
        <div className="space-y-4">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`x-check-${topic.id}`}
                  checked={selectedTopics.includes(topic.id)}
                  onCheckedChange={() => handleCheckboxChange(topic.id)}
                />
                <div>
                  <Label htmlFor={`x-check-${topic.id}`} className="font-medium">
                    {topic.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{topic.engagement}</p>
                </div>
              </div>
              <Badge variant="secondary">{topic.relevance}% relevant</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAddToQueue} disabled={selectedTopics.length === 0}>
          Add Selected to Queue
        </Button>
      </div>
    </div>
  )
}
