"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Instagram,
    Facebook,
    Youtube,
    Twitter,
    Linkedin,
    WorkflowIcon as Wordpress,
    Music,
    Upload,
    ChevronDown,
    ChevronUp,
    FileText,
    BarChart,
    ArrowRight,
    BookOpen,
    Plus,
    User,
    Trash2,
} from "lucide-react";
import { DayPlatformModule } from "@/components/DayPlatformModule";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ContentModificationModal } from "@/components/ContentModificationModal";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ContentPlannerCampaign,
    type Campaign,
} from "@/components/ContentPlannerCampaign";
import { ContentAnalysisWorkflow } from "@/components/ContentAnalysisWorkflow";
import { Checkbox } from "@/components/ui/checkbox";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { generateCustomScripts, getAllCampaigns, Service } from "@/components/Service";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/ErrorDialog";

const SAMPLE_AUTHOR_PROFILES = [
    {
        id: "1",
        name: "Ernest Hemingway",
        description: "Concise, direct prose with short sentences",
    },
    {
        id: "2",
        name: "Jane Austen",
        description: "Elegant, witty social commentary",
    },
    {
        id: "3",
        name: "David Foster Wallace",
        description: "Complex, footnote-heavy postmodern style",
    },
    {
        id: "4",
        name: "Stephen King",
        description: "Suspenseful, character-driven horror and thriller",
    },
    {
        id: "5",
        name: "Toni Morrison",
        description: "Poetic, rich with metaphor and cultural depth",
    },
];

const podcastShows = [
    {
        id: "podcast-1",
        title: "Tech Insights Weekly",
        excerpt:
            "A weekly deep dive into emerging technologies and their impact on business and society.",
        thumbnail: "/podcast-setup.png",
        episodeCount: 24,
        category: "Technology",
    },
    {
        id: "podcast-2",
        title: "Marketing Masterminds",
        excerpt:
            "Interviews with top marketing professionals sharing strategies that drive growth.",
        thumbnail: "/marketing-strategy-meeting.png",
        episodeCount: 18,
        category: "Marketing",
    },
    {
        id: "podcast-3",
        title: "Future of Work",
        excerpt:
            "Exploring how technology and culture are reshaping the workplace and workforce.",
        thumbnail: "/abstract-work.png",
        episodeCount: 12,
        category: "Business",
    },
];

interface TimeSlot {
    time: string;
    content: string;
    image: string;
}

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const PLATFORMS = [
    { name: "Instagram", icon: Instagram },
    { name: "Facebook", icon: Facebook },
    { name: "YouTube", icon: Youtube },
    { name: "Twitter", icon: Twitter },
    { name: "LinkedIn", icon: Linkedin },
    { name: "WordPress", icon: Wordpress },
    { name: "TikTok", icon: Music },
];

export default function Dashboard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [numberOfWeeks, setNumberOfWeeks] = useState("1");
    const [defaultPosts, setDefaultPosts] = useState("3");
    const [activeDays, setActiveDays] = useState<string[]>([]);
    const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
    const [isRegeneratingPlan, setIsRegeneratingPlan] = useState(false);

    const [timeSlots, setTimeSlots] = useState<
        Record<number, Record<string, Record<string, TimeSlot[]>>>
    >({});
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [mainIdeas, setMainIdeas] = useState<string[]>([]);
    const [subTopics, setSubTopics] = useState<string[][]>([]);
    const [platform, setPlatform] = useState<string | undefined>(undefined);
    const [isModificationModalOpen, setIsModificationModalOpen] = useState(false);
    const [selectedModification, setSelectedModification] = useState<{
        type: "main" | "sub";
        weekIndex: number;
        dayIndex?: number;
    }>({ type: "main", weekIndex: 0 });
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [isContentIdeasOpen, setIsContentIdeasOpen] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isStepThreeOpen, setIsStepThreeOpen] = useState(false);
    const stepTwoRef = useRef<HTMLDivElement>(null);
    const stepThreeRef = useRef<HTMLDivElement>(null);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isMainContent, setIsMainContent] = useState("");
    const [subTopic, setSubTopic] = useState<string | undefined>(undefined);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
        null
    );
    const [savedProfiles, setSavedProfiles] = useState(SAMPLE_AUTHOR_PROFILES);
    const [checkedProfiles, setCheckedProfiles] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const viewParam = searchParams.get("view");

    const [contentPlannerTab, setContentPlannerTab] = useState<
        "campaigns" | "workflow" | "settings"
    >(
        viewParam === "workflow"
            ? "workflow"
            : viewParam === "settings"
                ? "settings"
                : "campaigns"
    );

    const [showContentPlanner, setShowContentPlanner] = useState(
        tabParam === "content-planner"
    );

    // Fetch campaigns on component mount and sort by createdAt (newest first)
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await getAllCampaigns();
                if (response.status === "success") {
                    const fetchedCampaigns = response.message.campaigns || [];
                    // Sort campaigns by createdAt in descending order (newest first)
                    fetchedCampaigns.sort(
                        (a: Campaign, b: Campaign) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setCampaigns(fetchedCampaigns);
                } else {
                    console.error("Failed to fetch campaigns:", response.message);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to load campaigns. Please try again.",
                    });
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "An unexpected error occurred while loading campaigns.",
                });
            }
        };
        fetchCampaigns();
    }, []);

    const handleUpdateActiveDays = (days: string[]) => {
        setActiveDays(days);
    };

    const handleUpdateActivePlatforms = (platforms: string[]) => {
        setActivePlatforms(platforms);
    };

    const generateIdeas = () => {
        const weeks = Number.parseInt(numberOfWeeks);
        const days = activeDays.length;

        const newMainIdeas = Array(weeks)
            .fill("")
            .map((_, i) => `Main Idea for Week ${i + 1}`);
        setMainIdeas(newMainIdeas);

        const newSubTopics = Array(weeks)
            .fill([])
            .map(() =>
                Array(days)
                    .fill("")
                    .map((_, i) => `Sub-topic ${i + 1}`)
            );
        setSubTopics(newSubTopics);

        setTimeSlots((prevTimeSlots) => {
            const updatedTimeSlots = { ...prevTimeSlots };
            for (const week in updatedTimeSlots) {
                for (const day in updatedTimeSlots[week]) {
                    updatedTimeSlots[week][day] = Object.fromEntries(
                        Object.entries(updatedTimeSlots[week][day]).filter(([platform]) =>
                            activePlatforms.includes(platform)
                        )
                    );
                }
            }
            return updatedTimeSlots;
        });
    };

    // const handleNextStep = () => {
    //     if (currentStep === 1) {
    //         generateIdeas();
    //         setCurrentStep(2);
    //         setIsSettingsOpen(false);
    //         setIsContentIdeasOpen(true);
    //         setTimeout(scrollToStepTwo, 100);
    //     }
    // };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            if (!sourceFile) {
                console.error("No source file provided.");
                setIsSubmitted(true);
                return Promise.reject("No source file provided.");
            }

            setIsRegenerating(true);

            try {
                const formData = new FormData();
                formData.append("file", sourceFile);
                formData.append("week", numberOfWeeks);
                formData.append("days", activeDays.join(","));

                const response = await Service("extract_content", "POST", formData);

                if (response?.status === "success" && response?.content) {
                    const extractedContent = response.content;
                    const tempId = response.temp_id;

                    const newMainIdeas: string[] = [];
                    const newSubTopics: string[][] = [];

                    Object.keys(extractedContent).forEach((weekKey) => {
                        const weekData = extractedContent[weekKey];

                        const weekHeader = `Week: ${weekData.week}\nTopic: ${weekData.topic}\nQuote: “${weekData.quote}”`;
                        newMainIdeas.push(weekHeader);

                        const dayEntries = weekData.content_by_days || {};
                        const daysFormatted: string[] = [];

                        Object.keys(dayEntries).forEach((dayKey) => {
                            const dayData = dayEntries[dayKey];
                            const dayText = `${dayData.day}:\n  Subtopic: ${dayData.subtopic}\n  Quote: “${dayData.quote}”`;
                            daysFormatted.push(dayText);
                        });

                        newSubTopics.push(daysFormatted);
                    });

                    setMainIdeas(newMainIdeas);
                    setSubTopics(newSubTopics);
                } else {
                    console.warn("Unexpected API response format:", response);
                    alert("Failed to extract content from the source file.");
                }
            } catch (error) {
                console.error("An error occurred while extracting content. Please try again.", error);
                setErrorMessage("An error occurred while extracting content.");
                setShowErrorDialog(true); // Show dialog
                // alert("An error occurred while extracting content. Please try again.");
            } finally {
                setIsRegenerating(false);
            }

            setCurrentStep(2);
            setIsSettingsOpen(false);
            setTimeout(scrollToStepTwo, 100);
        }
    };

    // const handleFinalizePlan = () => {
    //     const newTimeSlots: Record<
    //         number,
    //         Record<string, Record<string, TimeSlot[]>>
    //     > = {};

    //     for (let week = 1; week <= Number.parseInt(numberOfWeeks); week++) {
    //         newTimeSlots[week] = {};
    //         for (const day of activeDays) {
    //             newTimeSlots[week][day] = {};
    //             for (const platform of activePlatforms) {
    //                 newTimeSlots[week][day][platform] = Array(
    //                     Number.parseInt(defaultPosts)
    //                 )
    //                     .fill(null)
    //                     .map((_, index) => ({
    //                         time: `${9 + index * 3}:00`,
    //                         content: "",
    //                         image: "",
    //                     }));
    //             }
    //         }
    //     }

    //     setTimeSlots(newTimeSlots);
    //     setCurrentStep(3);
    //     setIsContentIdeasOpen(false);
    //     setIsStepThreeOpen(true);
    //     setTimeout(() => {
    //         if (stepThreeRef.current) {
    //             stepThreeRef.current.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "start",
    //             });
    //         }
    //     }, 100);
    // };

    const handleFinalizePlan = async () => {
        setIsRegeneratingPlan(true);

        if (!sourceFile) {
            alert("Please upload a source file before finalizing the plan.");
            setIsRegeneratingPlan(false);
            return;
        }

        const platformPosts: { [key: string]: number } = {};
        activePlatforms.forEach((platform) => {
            platformPosts[platform] = Number(defaultPosts) || 1;
        });

        try {
            const customScripts = await generateCustomScripts(
                sourceFile,
                Number.parseInt(numberOfWeeks),
                activeDays,
                platformPosts
            );

            console.log("customScripts", customScripts);

            if (
                !customScripts ||
                (Array.isArray(customScripts) && customScripts.length === 0)
            ) {
                console.warn(
                    "Invalid response from generateCustomScripts:",
                    customScripts
                );
                alert(
                    "Failed to generate custom scripts. Please Connect Plateform First."
                );
                return;
            }

            if (!Array.isArray(customScripts) && customScripts.status !== "success") {
                console.warn("Failed to generate custom scripts:", customScripts);
                alert(
                    "Failed to generate custom scripts. Please Connect Plateform First."
                );
                return;
            }

            const resultsByPlatform = Array.isArray(customScripts)
                ? customScripts.reduce<Record<string, any[]>>((acc, item) => {
                    const platform = item.platform?.toLowerCase() || "unknown";
                    if (!acc[platform]) acc[platform] = [];
                    acc[platform].push(item);
                    return acc;
                }, {})
                : customScripts.results;

            console.log("Processed Results:", resultsByPlatform);

            const newTimeSlots: Record<
                number,
                Record<string, Record<string, TimeSlot[]>>
            > = {};

            for (let week = 1; week <= parseInt(numberOfWeeks); week++) {
                newTimeSlots[week] = {};

                for (const day of activeDays) {
                    newTimeSlots[week][day] = {};

                    for (const platform of activePlatforms) {
                        newTimeSlots[week][day][platform] = Array(parseInt(defaultPosts))
                            .fill(null)
                            .map((_, index) => ({
                                time: `${9 + index * 3}:00`,
                                content: "",
                                image: "",
                            }));

                        const platformResults =
                            resultsByPlatform[platform.toLowerCase()] || [];

                        if (!platformResults || platformResults.length === 0) {
                            console.warn(`No posts available for ${platform}`);
                            continue;
                        }

                        platformResults
                            .filter(
                                (item: any) =>
                                    item.week === week &&
                                    item.day.toLowerCase() === day.toLowerCase()
                            )
                            .forEach((item: any, index: number) => {
                                if (index < newTimeSlots[week][day][platform].length) {
                                    newTimeSlots[week][day][platform][index] = {
                                        time: `${9 + index * 3}:00`,
                                        content: item.content || "",
                                        image: item.image || "",
                                    };
                                }
                            });
                    }
                }
            }

            setTimeSlots(newTimeSlots);

            if (!Array.isArray(customScripts) && customScripts.status === "success") {
                const updatedTimeSlots = { ...newTimeSlots };

                for (const platform in customScripts.results) {
                    const normalizedPlatform = platform.toLowerCase();
                    const platformContent = customScripts.results[normalizedPlatform];

                    platformContent.forEach((post: any, index: number) => {
                        const { week, day, content } = post;
                        const normalizedDay = day.trim().toLowerCase();

                        if (
                            updatedTimeSlots[week] &&
                            updatedTimeSlots[week][normalizedDay] &&
                            updatedTimeSlots[week][normalizedDay][normalizedPlatform]
                        ) {
                            updatedTimeSlots[week][normalizedDay][normalizedPlatform][index] =
                            {
                                time: `${9 + index * 3}:00`,
                                content: content || "",
                                image: "",
                            };
                        }
                    });
                }

                setTimeSlots(updatedTimeSlots);
            }
        } catch (error) {
            console.error("Error during /generate_custom_scripts API call:", error);
            alert(
                "An error occurred while generating custom scripts. Please try again."
            );
            console.error("An error occurred while generating custom scripts.", error);
            setErrorMessage("An error occurred while generating custom scripts.");
            setShowErrorDialog(true); // Show dialog
        }

        setIsRegeneratingPlan(false);
        setCurrentStep(3);
        setIsContentIdeasOpen(false);

        setTimeout(() => {
            if (stepThreeRef.current) {
                stepThreeRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 1000);
    };

    const handleResetPlan = () => {
        setTimeSlots({});
        setCurrentStep(1);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSourceFile(event.target.files[0]);
        }
    };

    // const handleRegenerate = (
    //     type: "main" | "sub",
    //     weekIndex: number,
    //     dayIndex?: number
    // ) => {
    //     setSelectedModification({ type, weekIndex, dayIndex });
    //     setIsModificationModalOpen(true);
    // };

    const handleRegenerate = (
        type: "main" | "sub",
        weekIndex: number,
        dayIndex?: number,
        subTopic?: string
    ) => {
        setSelectedModification({ type, weekIndex, dayIndex });
        setSubTopic(subTopic);
        setIsModificationModalOpen(true);
    };

    // const handleModificationConfirm = (modifications: string) => {
    //     const { type, weekIndex, dayIndex } = selectedModification;
    //     if (type === "main") {
    //         setMainIdeas((prev) => {
    //             const newIdeas = [...prev];
    //             newIdeas[weekIndex] = `${prev[weekIndex]} (Modified: ${modifications})`;
    //             return newIdeas;
    //         });
    //     } else if (type === "sub" && dayIndex !== undefined) {
    //         setSubTopics((prev) => {
    //             const newTopics = [...prev];
    //             newTopics[weekIndex] = [...newTopics[weekIndex]];
    //             newTopics[weekIndex][
    //                 dayIndex
    //             ] = `${prev[weekIndex][dayIndex]} (Modified: ${modifications})`;
    //             return newTopics;
    //         });
    //     }
    //     setIsModificationModalOpen(false);
    // };

    const handleModificationConfirm = (modifications: string) => {
        const { type, weekIndex, dayIndex } = selectedModification;
        setIsMainContent(modifications);
        if (type === "main") {
            setMainIdeas((prev) => {
                const newIdeas = [...prev];

                if (!newIdeas[weekIndex]) {
                    newIdeas[weekIndex] = "";
                }

                const [weekLabel, currentContent] = newIdeas[weekIndex].split(":");

                newIdeas[weekIndex] = `${weekLabel}: ${modifications.trim()}`;

                return newIdeas;
            });
        } else if (type === "sub" && dayIndex !== undefined) {
            setSubTopics((prev) => {
                const newTopics = [...prev];

                if (!newTopics[weekIndex]) {
                    newTopics[weekIndex] = [];
                }

                const [weekLabel, currentContent] =
                    newTopics[weekIndex][dayIndex]?.split(":") || [];

                if (weekLabel) {
                    newTopics[weekIndex][
                        dayIndex
                    ] = `${weekLabel}: ${modifications.trim()}`;
                }

                return newTopics;
            });
        }
        setIsModificationModalOpen(false);
    };

    // const handleRegeneratePlan = async () => {
    //     setIsRegenerating(true);
    //     generateIdeas();
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     setCurrentStep(2);
    //     setIsRegenerating(false);
    // };

    const handleRegeneratePlan = async () => {
        if (!sourceFile) {
            alert("Please upload a source file before regenerating the plan.");
            return;
        }

        setIsRegenerating(true);

        try {
            const formData = new FormData();
            formData.append("file", sourceFile);
            formData.append("week", numberOfWeeks);
            formData.append("days", activeDays.join(","));

            const response = await Service("extract_content", "POST", formData);

            if (response?.status === "success" && response?.content) {
                const extractedContent = response.content;
                const tempId = response.temp_id;

                const newMainIdeas: string[] = [];
                const newSubTopics: string[][] = [];

                Object.keys(extractedContent).forEach((weekKey) => {
                    const weekContent = extractedContent[weekKey];

                    const weekTitle = weekContent?.week || weekKey;
                    const topic = weekContent?.topic || "";
                    const weekQuote = weekContent?.quote || "";

                    const mainIdea = `${weekTitle}: ${topic}\n"${weekQuote}"`;
                    newMainIdeas.push(mainIdea);

                    const contentByDays = weekContent?.content_by_days || {};
                    const dayTopics: string[] = [];

                    Object.keys(contentByDays).forEach((dayKey) => {
                        const dayContent = contentByDays[dayKey];
                        const dayName = dayContent?.day || dayKey;
                        const subtopic = dayContent?.subtopic || "";
                        const dayQuote = dayContent?.quote || "";

                        const subTopicFormatted = `${dayName}: ${subtopic}\n"${dayQuote}"`;
                        dayTopics.push(subTopicFormatted);
                    });

                    newSubTopics.push(dayTopics);
                });

                setMainIdeas(newMainIdeas);
                setSubTopics(newSubTopics);
            } else {
                // Handle the error case, optionally show a message to the user
                console.error("Failed to generate ideas:", response.message);
                setErrorMessage(response.message || "Failed to extract content from the source file.");
                setShowErrorDialog(true); // Show dialog
            }
        } catch (error) {
            console.error("Error during extract_content API call:", error);
            // alert("An error occurred while extracting content. Please try again.");
            console.error("An error occurred while extracting content.", error);
            setErrorMessage("An error occurred while extracting content.");
            setShowErrorDialog(true); // Show dialog
        } finally {
            setIsRegenerating(false);
            setCurrentStep(2);
        }
    };

    const scrollToStepTwo = () => {
        if (stepTwoRef.current) {
            stepTwoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleAddCampaign = (
        campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">
    ) => {
        const newCampaign: Campaign = {
            ...campaign,
            id: `campaign-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setCampaigns((prev) => {
            const updatedCampaigns = [...prev, newCampaign];
            // Sort campaigns by createdAt in descending order (newest first)
            updatedCampaigns.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return updatedCampaigns;
        });
        setSelectedCampaign(newCampaign);
    };

    const handleEditCampaign = (
        id: string,
        updatedCampaign: Partial<Campaign>
    ) => {
        setCampaigns((prev) => {
            const updatedCampaigns = prev.map((campaign) =>
                campaign.id === id
                    ? { ...campaign, ...updatedCampaign, updatedAt: new Date() }
                    : campaign
            );
            // Sort campaigns by createdAt in descending order (newest first)
            updatedCampaigns.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return updatedCampaigns;
        });

        if (selectedCampaign?.id === id) {
            setSelectedCampaign((prev) =>
                prev ? { ...prev, ...updatedCampaign, updatedAt: new Date() } : null
            );
        }
    };

    const handleDeleteCampaign = (id: string) => {
        setCampaigns((prev) => {
            const updatedCampaigns = prev.filter((campaign) => campaign.id !== id);
            // Sort campaigns by createdAt in descending order (newest first)
            updatedCampaigns.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return updatedCampaigns;
        });
        if (selectedCampaign?.id === id) {
            setSelectedCampaign(null);
        }
    };

    const handleStartAnalysis = async (campaignId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(`Starting analysis for campaign: ${campaignId}`);
    };

    const handleStartPlanning = () => {
        setShowContentPlanner(true);
    };

    const handleProfileCheckChange = (profileId: string) => {
        setCheckedProfiles((prev) => {
            if (prev.includes(profileId)) {
                return prev.filter((id) => id !== profileId);
            } else {
                return [...prev, profileId];
            }
        });
    };

    const handleSelectProfile = () => {
        if (checkedProfiles.length === 1) {
            alert(
                `Profile "${savedProfiles.find((p) => p.id === checkedProfiles[0])?.name
                }" selected for use`
            );
            setCheckedProfiles([]);
        }
    };

    const handleDeleteProfile = (profileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedProfiles(
            savedProfiles.filter((profile) => profile.id !== profileId)
        );
        if (checkedProfiles.includes(profileId)) {
            setCheckedProfiles((prev) => prev.filter((id) => id !== profileId));
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[#7A99A8]">
                <Header />
                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    <h1 className="text-4xl font-extrabold text-white">Plan Dashboard</h1>

                    <Tabs
                        defaultValue={
                            tabParam === "content-planner"
                                ? "content-planner"
                                : tabParam === "podcast-tools"
                                    ? "podcast-tools"
                                    : // : "content-planner"
                                    "author-planning"
                        }
                        className="w-full"
                    >
                        <TabsList className="w-full mb-4 bg-white">
                            <TabsTrigger value="author-planning" className="flex-1">
                                Author Planning
                            </TabsTrigger>
                            <TabsTrigger value="content-planner" className="flex-1">
                                Content Planner
                            </TabsTrigger>
                            <TabsTrigger value="podcast-tools" className="flex-1">
                                Podcast Tools
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="author-planning" className="space-y-6">
                            <Card className="w-full">
                                <Collapsible
                                    open={isSettingsOpen}
                                    onOpenChange={setIsSettingsOpen}
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full flex justify-between items-center p-4"
                                        >
                                            <span className="text-lg font-semibold">
                                                Plan Settings
                                            </span>
                                            {isSettingsOpen ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    {/* <CollapsibleContent>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="md:w-1/2 space-y-4">
                                                <h3 className="text-[1.1rem] font-semibold">
                                                    Upload Source Material
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Upload your source material here. This is what we will
                                                    use to break down each post in the plan. Source
                                                    material should be a PDF, Text Doc, MP3 for audio or
                                                    MP4 for video.
                                                </p>
                                                <div className="flex flex-col space-y-2">
                                                    <Input
                                                        id="source-material"
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx,.txt,.mp3,.mp4"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload
                                                    </Button>
                                                </div>
                                                {sourceFile && (
                                                    <p className="text-sm text-green-600">
                                                        File uploaded: {sourceFile.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex space-x-4">
                                                <div className="w-1/2">
                                                    <h3 className="text-[1.1rem] font-semibold mb-1">
                                                        Number of Weeks
                                                    </h3>
                                                    <Input
                                                        type="number"
                                                        id="numberOfWeeks"
                                                        value={numberOfWeeks}
                                                        onChange={(e) => {
                                                            const value = e.target.value.slice(0, 3);
                                                            setNumberOfWeeks(value);
                                                        }}
                                                        className="w-full"
                                                        max="999"
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <h3 className="text-[1.1rem] font-semibold mb-1">
                                                        Default Posts per Platform
                                                    </h3>
                                                    <Input
                                                        type="number"
                                                        id="defaultPosts"
                                                        value={defaultPosts}
                                                        onChange={(e) => {
                                                            const value = e.target.value.slice(0, 2);
                                                            setDefaultPosts(value);
                                                        }}
                                                        className="w-full"
                                                        max="99"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-[1.1rem] font-semibold mb-2">
                                                    Active Days
                                                </h3>
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={activeDays}
                                                    onValueChange={handleUpdateActiveDays}
                                                    className="flex flex-wrap gap-2 justify-start"
                                                >
                                                    {DAYS.map((day) => (
                                                        <ToggleGroupItem
                                                            key={day}
                                                            value={day}
                                                            aria-label={day}
                                                            className={`px-3 py-2 flex-1 justify-center day-button ${activeDays.includes(day) ? "active-day" : ""
                                                                }`}
                                                        >
                                                            {day}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            </div>
                                            <div>
                                                <h3 className="text-[1.1rem] font-semibold mb-2">
                                                    Active Platforms
                                                </h3>
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={activePlatforms}
                                                    onValueChange={handleUpdateActivePlatforms}
                                                    className="flex flex-wrap gap-2 justify-start"
                                                >
                                                    {PLATFORMS.map((platform) => (
                                                        <Tooltip key={platform.name}>
                                                            <TooltipTrigger asChild>
                                                                <ToggleGroupItem
                                                                    value={platform.name}
                                                                    aria-label={platform.name}
                                                                    className={`p-2 flex-1 justify-center platform-button ${activePlatforms.includes(platform.name)
                                                                        ? "active-platform"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    <platform.icon className="w-6 h-6" />
                                                                </ToggleGroupItem>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{platform.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </ToggleGroup>
                                            </div>

                                            <div className="pt-4">
                                                {currentStep === 1 ? (
                                                    <Button
                                                        onClick={handleNextStep}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                    >
                                                        Next Step
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleRegeneratePlan}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                        disabled={isRegenerating}
                                                    >
                                                        {isRegenerating ? (
                                                            <>
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Regenerating Plan...
                                                            </>
                                                        ) : (
                                                            "Regenerate Plan  aaa"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent> */}
                                    <CollapsibleContent>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="md:w-1/2 space-y-4">
                                                <h3 className="text-[1.1rem] font-semibold">
                                                    Upload Source Material
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Upload your source material here. This is what we will use
                                                    to break down each post in the plan. Source material
                                                    should be a PDF, Text Doc, MP3 for audio or MP4 for video.
                                                </p>
                                                <div className="flex flex-col space-y-2">
                                                    <Input
                                                        id="source-material"
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx,.txt,.mp3,.mp4"
                                                        className={`flex-1 ${!sourceFile && isSubmitted ? "border-red-500" : ""
                                                            }`}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!sourceFile) {
                                                                setIsSubmitted(true);
                                                                console.error("File upload is required.");
                                                                return;
                                                            }
                                                            console.log("File is uploaded:", sourceFile.name);
                                                        }}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload
                                                    </Button>
                                                </div>
                                                {!sourceFile && isSubmitted && (
                                                    <p className="text-sm text-red-600">
                                                        Please upload a source file.
                                                    </p>
                                                )}
                                                {sourceFile && (
                                                    <p className="text-sm text-green-600">
                                                        File uploaded: {sourceFile.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex space-x-4">
                                                <div className="w-1/2">
                                                    <h3 className="text-[1.1rem] font-semibold mb-1">
                                                        Number of Weeks
                                                    </h3>
                                                    <Input
                                                        type="number"
                                                        id="numberOfWeeks"
                                                        value={numberOfWeeks}
                                                        onChange={(e) => {
                                                            const value = e.target.value.slice(0, 3);
                                                            setNumberOfWeeks(value);
                                                        }}
                                                        className="w-full"
                                                        max="999"
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <h3 className="text-[1.1rem] font-semibold mb-1">
                                                        Default Posts per Platform
                                                    </h3>
                                                    <Input
                                                        type="number"
                                                        id="defaultPosts"
                                                        value={defaultPosts}
                                                        onChange={(e) => {
                                                            const value = e.target.value.slice(0, 2);
                                                            setDefaultPosts(value);
                                                        }}
                                                        className="w-full"
                                                        max="99"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-[1.1rem] font-semibold mb-2">
                                                    Active Days
                                                </h3>
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={activeDays}
                                                    onValueChange={handleUpdateActiveDays}
                                                    className="flex flex-wrap gap-2 justify-start"
                                                >
                                                    {DAYS.map((day) => (
                                                        <ToggleGroupItem
                                                            key={day}
                                                            value={day}
                                                            aria-label={day}
                                                            className={`px-3 py-2 flex-1 justify-center day-button ${activeDays.includes(day) ? "active-day" : ""
                                                                }`}
                                                        >
                                                            {day}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            </div>
                                            <div>
                                                <h3 className="text-[1.1rem] font-semibold mb-2">
                                                    Active Platforms
                                                </h3>
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={activePlatforms}
                                                    onValueChange={handleUpdateActivePlatforms}
                                                    className="flex flex-wrap gap-2 justify-start"
                                                >
                                                    {PLATFORMS.map((platform) => (
                                                        <Tooltip key={platform.name}>
                                                            <TooltipTrigger asChild>
                                                                <ToggleGroupItem
                                                                    value={platform.name}
                                                                    aria-label={platform.name}
                                                                    className={`p-2 flex-1 justify-center platform-button flex items-center transition${activePlatforms.includes(platform.name)
                                                                        ? "active-platform bg-muted text-black"
                                                                        : "text-black hover:bg-gray-100"
                                                                        }`}
                                                                >
                                                                    <platform.icon className="w-6 h-6" />
                                                                </ToggleGroupItem>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{platform.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </ToggleGroup>
                                            </div>
                                            <div className="pt-4">
                                                {currentStep === 1 ? (
                                                    <Button
                                                        onClick={handleNextStep}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                        disabled={isRegenerating} // Disable button while regenerating
                                                    >
                                                        {isRegenerating ? (
                                                            <>
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Next Step...
                                                            </>
                                                        ) : (
                                                            "Next Step"
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleRegeneratePlan}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                        disabled={isRegenerating}
                                                    >
                                                        {isRegenerating ? (
                                                            <>
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Regenerating Plan...
                                                            </>
                                                        ) : (
                                                            "Regenerate Plan"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>

                            {/* <Card className="w-full" ref={stepTwoRef}>
                                <Collapsible
                                    open={isContentIdeasOpen}
                                    onOpenChange={setIsContentIdeasOpen}
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full flex justify-between items-center p-4"
                                        >
                                            <span className="text-lg font-semibold">
                                                Step Two: Content Ideas
                                            </span>
                                            {isContentIdeasOpen ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-6">
                                                {mainIdeas.map((mainIdea, weekIndex) => (
                                                    <div key={weekIndex} className="space-y-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Textarea
                                                                value={mainIdea}
                                                                onChange={(e) => {
                                                                    const newMainIdeas = [...mainIdeas];
                                                                    newMainIdeas[weekIndex] = e.target.value;
                                                                    setMainIdeas(newMainIdeas);
                                                                }}
                                                                placeholder={`Main Idea for Week ${weekIndex + 1
                                                                    }`}
                                                                className="flex-grow"
                                                            />
                                                            <Button
                                                                onClick={() =>
                                                                    handleRegenerate("main", weekIndex)
                                                                }
                                                            >
                                                                Regenerate
                                                            </Button>
                                                        </div>
                                                        <div className="pl-4 space-y-2">
                                                            {subTopics[weekIndex]?.map(
                                                                (subTopic, dayIndex) => (
                                                                    <div
                                                                        key={dayIndex}
                                                                        className="flex items-center space-x-2"
                                                                    >
                                                                        <Textarea
                                                                            value={subTopic}
                                                                            onChange={(e) => {
                                                                                const newSubTopics = [...subTopics];
                                                                                newSubTopics[weekIndex][dayIndex] =
                                                                                    e.target.value;
                                                                                setSubTopics(newSubTopics);
                                                                            }}
                                                                            placeholder={`Sub-topic ${dayIndex + 1}`}
                                                                            className="flex-grow"
                                                                        />
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleRegenerate(
                                                                                    "sub",
                                                                                    weekIndex,
                                                                                    dayIndex
                                                                                )
                                                                            }
                                                                        >
                                                                            Regenerate
                                                                        </Button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-4">
                                                {currentStep === 2 ? (
                                                    <Button
                                                        onClick={handleFinalizePlan}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                    >
                                                        Accept and Finalize Plan
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleRegeneratePlan}
                                                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                        disabled={isRegenerating}
                                                    >
                                                        {isRegenerating ? (
                                                            <>
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Regenerating Plan...
                                                            </>
                                                        ) : (
                                                            "Regenerate Plan"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card> */}

                            {currentStep >= 2 && (
                                <Card className="w-full" ref={stepTwoRef}>
                                    <Collapsible
                                        open={isContentIdeasOpen}
                                        onOpenChange={setIsContentIdeasOpen}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full flex justify-between items-center p-4"
                                            >
                                                <span className="text-lg font-semibold">
                                                    Step Two: Content Ideas
                                                </span>
                                                {isContentIdeasOpen ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="space-y-6">
                                                    {mainIdeas.map((mainIdea, weekIndex) => (
                                                        <div key={weekIndex} className="space-y-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Textarea
                                                                    value={mainIdea}
                                                                    onChange={(e) => {
                                                                        const newMainIdeas = [...mainIdeas];
                                                                        newMainIdeas[weekIndex] = e.target.value;
                                                                        setMainIdeas(newMainIdeas);
                                                                    }}
                                                                    placeholder={`Main Idea for Week ${weekIndex + 1
                                                                        }`}
                                                                    className="flex-grow"
                                                                />
                                                                <Button
                                                                    onClick={() =>
                                                                        handleRegenerate("main", weekIndex, 0, mainIdea)
                                                                    }
                                                                >
                                                                    Regenerate
                                                                </Button>
                                                            </div>
                                                            <div className="pl-4 space-y-2">
                                                                {subTopics[weekIndex]?.map((subTopic, dayIndex) => (
                                                                    <div
                                                                        key={dayIndex}
                                                                        className="flex items-center space-x-2"
                                                                    >
                                                                        <Textarea
                                                                            value={subTopic}
                                                                            onChange={(e) => {
                                                                                const newSubTopics = [...subTopics];
                                                                                newSubTopics[weekIndex][dayIndex] =
                                                                                    e.target.value;
                                                                                setSubTopics(newSubTopics);
                                                                            }}
                                                                            placeholder={`Sub-topic ${dayIndex + 1}`}
                                                                            className="flex-grow"
                                                                        />
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleRegenerate(
                                                                                    "sub",
                                                                                    weekIndex,
                                                                                    dayIndex,
                                                                                    subTopic
                                                                                )
                                                                            }
                                                                        >
                                                                            Regenerate
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-4">
                                                    {currentStep === 2 ? (
                                                        <Button
                                                            onClick={handleFinalizePlan}
                                                            className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                            disabled={isRegeneratingPlan}
                                                        >
                                                            {isRegeneratingPlan ? (
                                                                <>
                                                                    <svg
                                                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                    Accept and Finalize Plan...
                                                                </>
                                                            ) : (
                                                                "Accept and Finalize Plan"
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={handleRegeneratePlan}
                                                            className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                            disabled={isRegenerating}
                                                        >
                                                            {isRegenerating ? (
                                                                <>
                                                                    <svg
                                                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                    Regenerating Plan...
                                                                </>
                                                            ) : (
                                                                "Regenerate Plan"
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            )}

                            {currentStep === 3 && (
                                <Card className="w-full" ref={stepThreeRef}>
                                    <Collapsible
                                        open={isStepThreeOpen}
                                        onOpenChange={setIsStepThreeOpen}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full flex justify-between items-center p-4"
                                            >
                                                <span className="text-lg font-semibold">
                                                    Step Three: The Plan
                                                </span>
                                                {isStepThreeOpen ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="p-6">
                                                <DayPlatformModule
                                                    numberOfWeeks={parseInt(numberOfWeeks)}
                                                    activeDays={activeDays}
                                                    activePlatforms={activePlatforms}
                                                    timeSlots={timeSlots}
                                                    setTimeSlots={setTimeSlots}
                                                    onResetPlan={handleResetPlan}
                                                />
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="content-planner" className="space-y-6">
                            {!showContentPlanner ? (
                                <Card>
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center py-16">
                                        <div className="flex space-x-8 mb-8">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 rounded-full bg-blue-100 mb-4">
                                                    <FileText className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2">
                                                    Content Planning
                                                </h3>
                                                <p className="text-gray-500 max-w-xs">
                                                    Create campaigns based on keywords or URLs to analyze
                                                    and generate content
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 rounded-full bg-green-100 mb-4">
                                                    <BarChart className="w-8 h-8 text-green-600" />
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2">
                                                    Content Analysis
                                                </h3>
                                                <p className="text-gray-500 max-w-xs">
                                                    Extract insights from your content sources using
                                                    advanced NLP techniques
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleStartPlanning}
                                            size="lg"
                                            className="bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                        >
                                            Let's Start Planning
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="w-full">
                                    <CardContent className="p-6">
                                        <Tabs
                                            value={contentPlannerTab}
                                            onValueChange={(value) =>
                                                setContentPlannerTab(
                                                    value as "campaigns" | "workflow" | "settings"
                                                )
                                            }
                                        >
                                            <TabsList className="w-full mb-6">
                                                <TabsTrigger value="campaigns" className="flex-1">
                                                    Campaigns
                                                </TabsTrigger>
                                                <TabsTrigger value="workflow" className="flex-1">
                                                    Content Analysis Workflow
                                                </TabsTrigger>
                                                <TabsTrigger value="settings" className="flex-1">
                                                    Settings
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="campaigns">
                                                <ContentPlannerCampaign
                                                    campaigns={
                                                        campaigns && campaigns.length > 0 ? campaigns : []
                                                    }
                                                    onAddCampaign={handleAddCampaign}
                                                    onEditCampaign={handleEditCampaign}
                                                    onDeleteCampaign={handleDeleteCampaign}
                                                />
                                            </TabsContent>

                                            <TabsContent value="workflow">
                                                <ContentAnalysisWorkflow />
                                            </TabsContent>

                                            <TabsContent value="settings">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h2 className="text-2xl font-bold">
                                                            Author Personalities
                                                        </h2>
                                                        <Link href="/dashboard/author-personality/add">
                                                            <Button className="bg-[#3d545f] text-white hover:bg-[#3d545f]/90">
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Personality
                                                            </Button>
                                                        </Link>
                                                    </div>

                                                    {savedProfiles.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                {savedProfiles.map((profile) => (
                                                                    <div
                                                                        key={profile.id}
                                                                        className="p-3 border rounded-md flex items-center justify-between hover:bg-gray-50"
                                                                    >
                                                                        <div className="flex items-center space-x-3">
                                                                            <Checkbox
                                                                                id={`profile-${profile.id}`}
                                                                                checked={checkedProfiles.includes(
                                                                                    profile.id
                                                                                )}
                                                                                onCheckedChange={() =>
                                                                                    handleProfileCheckChange(profile.id)
                                                                                }
                                                                                className="h-5 w-5"
                                                                            />
                                                                            <div>
                                                                                <h4 className="font-medium">
                                                                                    {profile.name}
                                                                                </h4>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {profile.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex space-x-2">
                                                                            <Link
                                                                                href={`/dashboard/author-personality/edit/${profile.id}`}
                                                                            >
                                                                                <Button variant="outline" size="sm">
                                                                                    Edit
                                                                                </Button>
                                                                            </Link>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={(e) =>
                                                                                    handleDeleteProfile(profile.id, e)
                                                                                }
                                                                                className="opacity-70 hover:opacity-100"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="flex justify-end">
                                                                <Button
                                                                    onClick={handleSelectProfile}
                                                                    disabled={checkedProfiles.length !== 1}
                                                                    className="bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                                                                >
                                                                    <User className="mr-2 h-4 w-4" />
                                                                    Use Selected Personality
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500 border rounded-md">
                                                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                                            <p>No saved author profiles yet</p>
                                                            <p className="text-sm">
                                                                Add a personality to get started
                                                            </p>
                                                            <Link
                                                                href="/dashboard/author-personality/add"
                                                                className="mt-4 inline-block"
                                                            >
                                                                <Button className="bg-[#3d545f] text-white hover:bg-[#3d545f]/90 mt-4">
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add Your First Personality
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="podcast-tools" className="space-y-6">
                            <Card className="w-full">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">Podcast Shows</h2>
                                        <Link href="/dashboard/podcast/add">
                                            <Button className="bg-[#3d545f] text-white hover:bg-[#3d545f]/90">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add a Show
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {podcastShows.map((show) => (
                                            <div
                                                key={show.id}
                                                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <Image
                                                    src={show.thumbnail || "/placeholder.svg"}
                                                    alt={show.title}
                                                    width={120}
                                                    height={120}
                                                    className="rounded-md object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-semibold">
                                                        {show.title}
                                                    </h3>
                                                    <p className="text-gray-600 line-clamp-2 mt-1">
                                                        {show.excerpt}
                                                    </p>
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        <span className="inline-flex items-center mr-4">
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            {show.episodeCount} Episodes
                                                        </span>
                                                        <span className="inline-flex items-center">
                                                            <BookOpen className="w-4 h-4 mr-1" />
                                                            {show.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={`/dashboard/podcast/edit/${show.id}`}>
                                                    <Button variant="outline">Edit Episode</Button>
                                                </Link>
                                            </div>
                                        ))}

                                        {podcastShows.length === 0 && (
                                            <div className="text-center py-12 border rounded-lg">
                                                <Music className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                                <p className="text-gray-500">No podcast shows yet</p>
                                                <p className="text-sm text-gray-400">
                                                    Add your first show to get started
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <ErrorDialog
                        isOpen={showErrorDialog}
                        onClose={() => setShowErrorDialog(false)}
                        message={errorMessage || ''}
                    />

                    <ContentModificationModal
                        isOpen={isModificationModalOpen}
                        onClose={() => setIsModificationModalOpen(false)}
                        onRegenerate={handleModificationConfirm}
                        contentType={selectedModification.type === "main" ? "main" : "sub"}
                        subTopic={subTopic ?? ""}
                        platform={platform ?? ""}
                    />
                </main>
            </div>
        </TooltipProvider>
    );
}
