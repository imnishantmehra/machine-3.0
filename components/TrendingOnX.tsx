"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface TrendingOnXProps {
  trendingContent: { text: string }[];
  onAddToQueue: (text: string) => void;
}

export function TrendingOnX({ trendingContent, onAddToQueue }: TrendingOnXProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [trendingTopic, setTrendingTopic] = useState([])

  // useEffect(() => {
  //   setTrendingTopic(trendingContent)
  // }, [])

  // Default trending topics
  // const trendingTopics = [
  //   { id: "x-1", name: "#ContentMarketing", engagement: "125K tweets", relevance: 92 },
  //   { id: "x-2", name: "#DigitalStrategy", engagement: "87K tweets", relevance: 88 },
  //   { id: "x-3", name: "#MarketingAutomation", engagement: "63K tweets", relevance: 76 },
  //   { id: "x-4", name: "#BrandAwareness", engagement: "112K tweets", relevance: 85 },
  //   { id: "x-5", name: "#SocialMediaROI", engagement: "94K tweets", relevance: 79 },
  // ]

  const handleSearch = () => {
    // In a real app, this would search for trending topics
    console.log("Searching for:", searchQuery)
  }

  const handleCheckboxChange = (topicId: string) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  const handleAddToQueue = () => {
    return
    // Read existing data or initialize to empty object
    // const data = localStorage.getItem("contentGenPayload") || "{}";
    // const parsed = JSON.parse(data);

    // // Add the trendingTopic key with the selectedTopics array
    // const newData = {
    //   ...parsed,
    //   trendingTopic: selectedTopics, // Ensure selectedTopics is in scope
    // };

    // // Save it back to localStorage
    // localStorage.setItem("contentGenPayload", JSON.stringify(newData));
  };

  // useEffect(() => {
  //   const data = localStorage.getItem("contentGenPayload") || "{}";
  //   const parsed = JSON.parse(data);
  //   const savedTopics: string[] = parsed.trendingTopic || [];

  //   // Make sure savedTopics is an array of strings (topic.text values)
  //   setSelectedTopics(savedTopics);
  // }, []);


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
          {trendingTopic.map((topic, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`x-check-${index}`}
                  checked={selectedTopics.includes(topic.text)}
                  onCheckedChange={() => handleCheckboxChange(topic.text)}
                />
                <div>
                  <Label htmlFor={`x-check-${index}`} className="font-medium">
                    {topic.text.length > 100 ? topic.text.slice(0, 100) + '...' : topic.text}
                  </Label>
                  <p className="text-sm text-muted-foreground">Tweet snippet</p>
                </div>
              </div>
              <Badge variant="secondary">{Math.floor(Math.random() * 41) + 60}% relevant</Badge>
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
