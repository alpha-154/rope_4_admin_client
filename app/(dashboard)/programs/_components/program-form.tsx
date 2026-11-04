"use client";

import { DeleteAlert } from "@/components/shared/delete-alert";
import { TipTapEditor } from "@/components/shared/tiptap-editor";
import { UploadFiles } from "@/components/shared/upload-files";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Switch } from "@/components/ui/switch/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Textarea } from "@/components/ui/textarea/textarea";
import { apiClient } from "@/lib/axios";
import {
  CalendarDays,
  Compass,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export interface ProgramFormData {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  country: string;
  region: string;
  shortDescription: string;
  description: string;
  badge: string;
  heroImages: string[];
  gallery: string[];
  duration: number;
  difficulty: string;
  maxAltitude: string;
  distance: string;
  season: string[];
  months: string[];
  baseCamp: string;
  startPoint: string;
  accommodation: string;
  food: string;
  transport: string;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    altitude?: string;
    distance?: string;
    stay?: string;
    meals?: string;
  }>;
  eligibility: string;
  howToReach: string;
  costIncludes: string[];
  costExcludes: string[];
  cancellationPolicy: string;
  essentials: string[];
  videoUrl: string;
  price: {
    amount: number;
    currency: string;
    taxNote?: string;
  };
  departures: Array<{
    startDate: string;
    endDate: string;
    seatsTotal: number;
    seatsBooked: number;
    priceOverride?: number;
    status: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  seo: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  isFeatured: boolean;
  status: string;
}

const CATEGORIES = [
  "Trek",
  "Expedition",
  "Premium Trip",
  "Summer Camp",
  "Family With Kids",
  "Learning Program",
  "Wilderness Survival",
];

const DIFFICULTIES = [
  "Easy",
  "Easy to Moderate",
  "Moderate",
  "Moderate to Difficult",
  "Difficult",
  "Challenging",
];

const ALL_SEASONS = ["Spring", "Summer", "Monsoon", "Autumn", "Winter"];
const ALL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const defaultProgramData: ProgramFormData = {
  title: "",
  slug: "",
  category: "Trek",
  country: "India",
  region: "Uttarakhand",
  shortDescription: "",
  description: "",
  badge: "",
  heroImages: [],
  gallery: [],
  duration: 6,
  difficulty: "Easy to Moderate",
  maxAltitude: "",
  distance: "",
  season: ["Winter", "Spring"],
  months: ["December", "January", "February"],
  baseCamp: "",
  startPoint: "",
  accommodation: "",
  food: "",
  transport: "",
  itinerary: [
    {
      day: 1,
      title: "Arrival and Basecamp Check-in",
      description: "Arrive at the base camp, meet trek leaders, and undergo briefing & gear check.",
    },
  ],
  eligibility: "",
  howToReach: "",
  costIncludes: ["Certified Mountain Leaders & Guides", "All permits and forest passes", "Nutritious vegetarian meals on trek"],
  costExcludes: ["Personal equipment & clothing", "Emergency evacuation costs"],
  cancellationPolicy: "",
  essentials: ["Thermal base layers", "Waterproof trekking shoes", "Headlamp & spare batteries"],
  videoUrl: "",
  price: {
    amount: 15000,
    currency: "BDT",
    taxNote: "per person",
  },
  departures: [
    {
      startDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
      seatsTotal: 16,
      seatsBooked: 2,
      priceOverride: 0,
      status: "available",
    },
  ],
  faqs: [],
  seo: {
    title: "",
    description: "",
    ogImage: "",
  },
  location: {
    type: "Point",
    coordinates: [78.18, 31.07],
  },
  isFeatured: false,
  status: "draft",
};

interface ProgramFormProps {
  initialData?: ProgramFormData;
  isEditing?: boolean;
}

export function ProgramForm({
  initialData,
  isEditing = false,
}: ProgramFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProgramFormData>(
    initialData ? { ...defaultProgramData, ...initialData } : defaultProgramData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // String item helpers (costIncludes, costExcludes, essentials)
  const addStringItem = (
    field: "costIncludes" | "costExcludes" | "essentials",
    defaultValue = ""
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeStringItem = (
    field: "costIncludes" | "costExcludes" | "essentials",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index),
    }));
  };

  const updateStringItem = (
    field: "costIncludes" | "costExcludes" | "essentials",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  // Itinerary helpers
  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: `Day ${prev.itinerary.length + 1} Trek`,
          description: "",
        },
      ],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, idx) => idx !== index)
        .map((day, idx) => ({ ...day, day: idx + 1 })),
    }));
  };

  // Departures helpers
  const addDeparture = () => {
    setFormData((prev) => ({
      ...prev,
      departures: [
        ...prev.departures,
        {
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
          seatsTotal: 16,
          seatsBooked: 0,
          priceOverride: 0,
          status: "available",
        },
      ],
    }));
  };

  const removeDeparture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      departures: prev.departures.filter((_, idx) => idx !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Program title is required");
      setActiveTab("overview");
      return;
    }

    if (formData.itinerary.length === 0) {
      toast.error("Please add at least 1 day in the itinerary");
      setActiveTab("itinerary");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating program..." : "Publishing program..."
    );

    try {
      const payload = {
        ...formData,
        price: {
          ...formData.price,
          amount: Number(formData.price.amount),
        },
        duration: Number(formData.duration),
        departures: formData.departures.map((d) => ({
          ...d,
          seatsTotal: Number(d.seatsTotal),
          seatsBooked: Number(d.seatsBooked),
          priceOverride: d.priceOverride ? Number(d.priceOverride) : undefined,
        })),
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/programs/${formData._id}`, payload);
        toast.dismiss(toastId);
        toast.success("Program updated successfully");
      } else {
        await apiClient.post("/programs", payload);
        toast.dismiss(toastId);
        toast.success("Program published successfully");
      }

      router.push("/programs");
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || "Failed to save program";
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Edit: ${formData.title || "Program"}` : "Create Adventure Program"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure trek logistics, multi-day itinerary, fixed departures, and rich media.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/programs")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Program"}
          </Button>
        </div>
      </div>

      {/* Multi-Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1 bg-muted">
          <TabsTrigger value="overview" className="gap-2 py-2 text-xs md:text-sm">
            <Compass className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2 py-2 text-xs md:text-sm">
            <ImageIcon className="h-4 w-4" /> Media & Gallery
          </TabsTrigger>
          <TabsTrigger value="logistics" className="gap-2 py-2 text-xs md:text-sm">
            <MapPin className="h-4 w-4" /> Logistics & Stats
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="gap-2 py-2 text-xs md:text-sm">
            <CalendarDays className="h-4 w-4" /> Itinerary ({formData.itinerary.length})
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2 py-2 text-xs md:text-sm">
            <FileText className="h-4 w-4" /> Inclusions & Rules
          </TabsTrigger>
          <TabsTrigger value="departures" className="gap-2 py-2 text-xs md:text-sm">
            <CalendarDays className="h-4 w-4" /> Departures & Pricing
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Program Information</CardTitle>
              <CardDescription>Primary identifiers and marketing copy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Program / Trek Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Kedarkantha Winter Summit Trek"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="e.g. kedarkantha-winter-summit-trek"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, category: val }))
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g. India, Nepal, Bhutan"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, country: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="region">Region / State *</Label>
                  <Input
                    id="region"
                    placeholder="e.g. Uttarakhand, Himachal Pradesh"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, region: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (Days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="difficulty">Difficulty Grade *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, difficulty: val }))
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="badge">Promotional Badge</Label>
                  <Input
                    id="badge"
                    placeholder="e.g. Best Seller, Recommended"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, badge: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortDescription">Short Summary (Card teaser) *</Label>
                <Textarea
                  id="shortDescription"
                  rows={2}
                  placeholder="One or two sentences summarizing the adventure..."
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Detailed Program Overview (Rich Text)</Label>
                <TipTapEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
                  minHeight="220px"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFeatured: checked }))
                    }
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured on Homepage
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Label htmlFor="status">Publishing Status:</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger id="status" className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MEDIA & GALLERY */}
        <TabsContent value="media" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Banner & Gallery Media</CardTitle>
              <CardDescription>
                High-resolution imagery for banners, cards, and lightbox galleries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold">Hero Images (Main banner)</Label>
                <UploadFiles
                  value={formData.heroImages}
                  onChange={(urls) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroImages: Array.isArray(urls) ? urls : [urls],
                    }))
                  }
                  folder="programs/hero"
                  multiple
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Program Gallery</Label>
                <UploadFiles
                  value={formData.gallery}
                  onChange={(urls) =>
                    setFormData((prev) => ({
                      ...prev,
                      gallery: Array.isArray(urls) ? urls : [urls],
                    }))
                  }
                  folder="programs/gallery"
                  multiple
                />
              </div>

              <div className="space-y-1.5 pt-4 border-t">
                <Label htmlFor="videoUrl">Promo Video URL (YouTube / Vimeo)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: LOGISTICS & STATS */}
        <TabsContent value="logistics" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mountain Specs & Logistics</CardTitle>
              <CardDescription>Key technical data and travel arrangements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxAltitude">Maximum Altitude</Label>
                  <Input
                    id="maxAltitude"
                    placeholder="e.g. 12,500 ft / 3,810 m"
                    value={formData.maxAltitude}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxAltitude: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="distance">Trek Distance</Label>
                  <Input
                    id="distance"
                    placeholder="e.g. 24 km"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, distance: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="baseCamp">Base Camp</Label>
                  <Input
                    id="baseCamp"
                    placeholder="e.g. Sankri Village"
                    value={formData.baseCamp}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, baseCamp: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startPoint">Meeting / Pickup Point</Label>
                  <Input
                    id="startPoint"
                    placeholder="e.g. Dehradun Railway Station by 6:30 AM"
                    value={formData.startPoint}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startPoint: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="accommodation">Accommodation</Label>
                  <Input
                    id="accommodation"
                    placeholder="e.g. Homestay & 4-season tents"
                    value={formData.accommodation}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, accommodation: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="food">Meals & Diet</Label>
                  <Input
                    id="food"
                    placeholder="e.g. Nutritious veg meals + eggs"
                    value={formData.food}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, food: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="transport">Transport Info</Label>
                  <Input
                    id="transport"
                    placeholder="e.g. Non-AC Tempo Traveler"
                    value={formData.transport}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, transport: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Seasons and Months checkboxes */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="font-semibold">Ideal Seasons</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SEASONS.map((season) => {
                    const isSelected = formData.season.includes(season);
                    return (
                      <Badge
                        key={season}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer py-1 px-3 text-xs"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            season: isSelected
                              ? prev.season.filter((s) => s !== season)
                              : [...prev.season, season],
                          }))
                        }
                      >
                        {season}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <Label className="font-semibold">Best Months</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_MONTHS.map((month) => {
                    const isSelected = formData.months.includes(month);
                    return (
                      <Badge
                        key={month}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer py-1 px-3 text-xs"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            months: isSelected
                              ? prev.months.filter((m) => m !== month)
                              : [...prev.months, month],
                          }))
                        }
                      >
                        {month}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Geo Coordinates */}
              <div className="space-y-2 pt-3 border-t">
                <Label className="font-semibold">Geographical Coordinates (2dsphere)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 78.18"
                      value={formData.location.coordinates[0]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            type: "Point",
                            coordinates: [
                              parseFloat(e.target.value) || 0,
                              prev.location.coordinates[1],
                            ],
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 31.07"
                      value={formData.location.coordinates[1]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            type: "Point",
                            coordinates: [
                              prev.location.coordinates[0],
                              parseFloat(e.target.value) || 0,
                            ],
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ITINERARY */}
        <TabsContent value="itinerary" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Day-by-Day Itinerary</CardTitle>
                <CardDescription>
                  Detailed trail steps, daily altitude gain, trekking distance, and meals.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItineraryDay} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Day
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.itinerary.map((day, idx) => (
                <div
                  key={idx}
                  className="relative p-4 border rounded-lg bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-primary">Day {day.day}</span>
                    {formData.itinerary.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItineraryDay(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Day Title *</Label>
                    <Input
                      placeholder="e.g. Trek from Sankri to Juda Ka Talab"
                      value={day.title}
                      onChange={(e) => {
                        const copy = [...formData.itinerary];
                        copy[idx].title = e.target.value;
                        setFormData((prev) => ({ ...prev, itinerary: copy }));
                      }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Altitude</Label>
                      <Input
                        placeholder="e.g. 9,100 ft"
                        value={day.altitude || ""}
                        onChange={(e) => {
                          const copy = [...formData.itinerary];
                          copy[idx].altitude = e.target.value;
                          setFormData((prev) => ({ ...prev, itinerary: copy }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Distance</Label>
                      <Input
                        placeholder="e.g. 4 km (5 hrs)"
                        value={day.distance || ""}
                        onChange={(e) => {
                          const copy = [...formData.itinerary];
                          copy[idx].distance = e.target.value;
                          setFormData((prev) => ({ ...prev, itinerary: copy }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Stay</Label>
                      <Input
                        placeholder="e.g. Alpine Tents"
                        value={day.stay || ""}
                        onChange={(e) => {
                          const copy = [...formData.itinerary];
                          copy[idx].stay = e.target.value;
                          setFormData((prev) => ({ ...prev, itinerary: copy }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Meals</Label>
                      <Input
                        placeholder="e.g. Breakfast, Lunch, Dinner"
                        value={day.meals || ""}
                        onChange={(e) => {
                          const copy = [...formData.itinerary];
                          copy[idx].meals = e.target.value;
                          setFormData((prev) => ({ ...prev, itinerary: copy }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Day Details *</Label>
                    <Textarea
                      rows={3}
                      placeholder="Describe the trail terrain, highlights, water sources, and views..."
                      value={day.description}
                      onChange={(e) => {
                        const copy = [...formData.itinerary];
                        copy[idx].description = e.target.value;
                        setFormData((prev) => ({ ...prev, itinerary: copy }));
                      }}
                      required
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: POLICIES & ESSENTIALS */}
        <TabsContent value="policies" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inclusions, Exclusions & Policies</CardTitle>
              <CardDescription>
                Terms, eligibility criteria, and preparation checklists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cost Includes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Cost Includes (Inclusions)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStringItem("costIncludes", "")}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Inclusions
                  </Button>
                </div>
                {formData.costIncludes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. All accommodation, meals, mountaineering permits"
                      value={item}
                      onChange={(e) => updateStringItem("costIncludes", idx, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => removeStringItem("costIncludes", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Cost Excludes */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Cost Excludes (Exclusions)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStringItem("costExcludes", "")}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Exclusion
                  </Button>
                </div>
                {formData.costExcludes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. Personal gear, insurance, emergency rescue"
                      value={item}
                      onChange={(e) => updateStringItem("costExcludes", idx, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => removeStringItem("costExcludes", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Essentials */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Trek Essentials / Packing Checklist</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStringItem("essentials", "")}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>
                {formData.essentials.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. 50L Backpack with rain cover"
                      value={item}
                      onChange={(e) => updateStringItem("essentials", idx, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => removeStringItem("essentials", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Eligibility & Cancellation policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="eligibility">Eligibility & Fitness Criteria</Label>
                  <Textarea
                    id="eligibility"
                    rows={4}
                    placeholder="Prerequisites, minimum age, cardiovascular benchmark..."
                    value={formData.eligibility}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, eligibility: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cancellationPolicy">Cancellation & Refund Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    rows={4}
                    placeholder="Clear cancellation timelines and percentage deductions..."
                    value={formData.cancellationPolicy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cancellationPolicy: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t">
                <Label htmlFor="howToReach">How to Reach (Transportation Guide)</Label>
                <Textarea
                  id="howToReach"
                  rows={3}
                  placeholder="Directions by air, train, and road from major transit hubs..."
                  value={formData.howToReach}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, howToReach: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: DEPARTURES & PRICING */}
        <TabsContent value="departures" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Base Pricing</CardTitle>
              <CardDescription>Default tariff per participant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Base Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={formData.price.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: { ...prev.price, amount: Number(e.target.value) },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency Code *</Label>
                  <Input
                    id="currency"
                    placeholder="BDT, USD, INR"
                    value={formData.price.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: { ...prev.price, currency: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="taxNote">Tax / Per-person Note</Label>
                  <Input
                    id="taxNote"
                    placeholder="e.g. per person (+ 5% GST)"
                    value={formData.price.taxNote || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: { ...prev.price, taxNote: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fixed Departure Batches</CardTitle>
                <CardDescription>
                  Calendar batches with slots, booking tracker, and availability status.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDeparture} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Batch
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.departures.map((batch, idx) => (
                <div
                  key={idx}
                  className="relative p-4 border rounded-lg bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-muted-foreground">
                      Batch #{idx + 1}
                    </span>
                    {formData.departures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeDeparture(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Date *</Label>
                      <Input
                        type="date"
                        value={batch.startDate.split("T")[0]}
                        onChange={(e) => {
                          const copy = [...formData.departures];
                          copy[idx].startDate = e.target.value;
                          setFormData((prev) => ({ ...prev, departures: copy }));
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date *</Label>
                      <Input
                        type="date"
                        value={batch.endDate.split("T")[0]}
                        onChange={(e) => {
                          const copy = [...formData.departures];
                          copy[idx].endDate = e.target.value;
                          setFormData((prev) => ({ ...prev, departures: copy }));
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total Slots</Label>
                      <Input
                        type="number"
                        min="1"
                        value={batch.seatsTotal}
                        onChange={(e) => {
                          const copy = [...formData.departures];
                          copy[idx].seatsTotal = Number(e.target.value);
                          setFormData((prev) => ({ ...prev, departures: copy }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={batch.status}
                        onValueChange={(val) => {
                          const copy = [...formData.departures];
                          copy[idx].status = val;
                          setFormData((prev) => ({ ...prev, departures: copy }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="filling-fast">Filling Fast</SelectItem>
                          <SelectItem value="almost-full">Almost Full</SelectItem>
                          <SelectItem value="sold-out">Sold Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
