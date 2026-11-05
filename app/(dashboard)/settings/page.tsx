"use client";

import { UploadFiles } from "@/components/shared/upload-files";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { apiClient } from "@/lib/axios";
import {
  Check,
  FolderPlus,
  Layers,
  Link as LinkIcon,
  Loader2,
  Menu,
  PanelBottom,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SiteSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("header");

  const [header, setHeader] = useState<any>({
    logoUrl: "",
    logoText: "Rope4",
    tagline: "Outdoor Education & Adventure",
    announcement: {
      enabled: false,
      text: "",
      linkUrl: "",
      badge: "Notice",
    },
    quickContact: {
      phone: "",
      email: "",
      address: "",
    },
    ctaButton: {
      label: "Plan Adventure",
      url: "/programs",
      isVisible: true,
    },
    navItems: [],
  });

  const [footer, setFooter] = useState<any>({
    aboutText: "",
    copyright: "",
    emergencyHotline: "",
    columns: [],
    socialLinks: [],
    bottomLinks: [],
    badges: [],
  });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/admin/settings/site");
      const data = res.data?.data;
      if (data) {
        if (data.header) setHeader(data.header);
        if (data.footer) setFooter(data.footer);
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      toast.error(err.response?.data?.message || "Failed to load site settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const toastId = toast.loading("Saving site settings...");

      // Clean payload for forbidNonWhitelisted
      const cleanHeaderNavItems = (header.navItems || []).map((item: any) => {
        const { _id, id, ...itemRest } = item;
        return {
          ...itemRest,
          children: (itemRest.children || []).map((c: any) => {
            const { _id: _cid, id: _cid2, ...cRest } = c;
            return cRest;
          }),
          megaMenuCategories: (itemRest.megaMenuCategories || []).map((cat: any) => {
            const { _id: _catId, id: _catId2, ...catRest } = cat;
            return {
              ...catRest,
              items: (catRest.items || []).map((sub: any) => {
                const { _id: _subId, id: _subId2, ...subRest } = sub;
                return subRest;
              }),
            };
          }),
        };
      });

      const cleanFooterColumns = (footer.columns || []).map((col: any) => {
        const { _id, id, ...colRest } = col;
        return {
          ...colRest,
          links: (colRest.links || []).map((l: any) => {
            const { _id: _lid, id: _lid2, ...lRest } = l;
            return lRest;
          }),
        };
      });

      const cleanFooterSocials = (footer.socialLinks || []).map((s: any) => {
        const { _id, id, ...sRest } = s;
        return sRest;
      });

      const cleanFooterBottomLinks = (footer.bottomLinks || []).map((b: any) => {
        const { _id, id, ...bRest } = b;
        return bRest;
      });

      const cleanFooterBadges = (footer.badges || []).map((bg: any) => {
        const { _id, id, ...bgRest } = bg;
        return bgRest;
      });

      const payload = {
        header: {
          ...header,
          navItems: cleanHeaderNavItems,
        },
        footer: {
          ...footer,
          columns: cleanFooterColumns,
          socialLinks: cleanFooterSocials,
          bottomLinks: cleanFooterBottomLinks,
          badges: cleanFooterBadges,
        },
      };

      await apiClient.patch("/admin/settings/site", payload);
      toast.dismiss(toastId);
      toast.success("Site navigation and settings saved successfully");
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error(err.response?.data?.message || "Failed to update site settings");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Header Nav Item Helpers ---
  const addNavItem = () => {
    setHeader((prev: any) => ({
      ...prev,
      navItems: [
        ...prev.navItems,
        {
          label: "New Page",
          href: "/programs",
          isMegaMenu: false,
          children: [],
          megaMenuCategories: [],
        },
      ],
    }));
  };

  const removeNavItem = (index: number) => {
    setHeader((prev: any) => ({
      ...prev,
      navItems: prev.navItems.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateNavItem = (index: number, updates: any) => {
    setHeader((prev: any) => {
      const updated = [...prev.navItems];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, navItems: updated };
    });
  };

  const addNavChild = (itemIndex: number) => {
    setHeader((prev: any) => {
      const items = [...prev.navItems];
      const children = items[itemIndex].children || [];
      items[itemIndex].children = [
        ...children,
        { label: "Sub Link", href: "/programs" },
      ];
      return { ...prev, navItems: items };
    });
  };

  const removeNavChild = (itemIndex: number, childIndex: number) => {
    setHeader((prev: any) => {
      const items = [...prev.navItems];
      items[itemIndex].children = items[itemIndex].children.filter(
        (_: any, ci: number) => ci !== childIndex
      );
      return { ...prev, navItems: items };
    });
  };

  // --- Footer Column Helpers ---
  const addFooterColumn = () => {
    setFooter((prev: any) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          title: "New Section",
          links: [{ label: "Link Title", url: "/" }],
        },
      ],
    }));
  };

  const removeFooterColumn = (colIndex: number) => {
    setFooter((prev: any) => ({
      ...prev,
      columns: prev.columns.filter((_: any, i: number) => i !== colIndex),
    }));
  };

  const addFooterLink = (colIndex: number) => {
    setFooter((prev: any) => {
      const cols = [...prev.columns];
      cols[colIndex].links = [
        ...(cols[colIndex].links || []),
        { label: "New Link", url: "/" },
      ];
      return { ...prev, columns: cols };
    });
  };

  const removeFooterLink = (colIndex: number, linkIndex: number) => {
    setFooter((prev: any) => {
      const cols = [...prev.columns];
      cols[colIndex].links = cols[colIndex].links.filter(
        (_: any, li: number) => li !== linkIndex
      );
      return { ...prev, columns: cols };
    });
  };

  // --- Footer Social Helpers ---
  const addSocialLink = () => {
    setFooter((prev: any) => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform: "Instagram", url: "https://instagram.com/rope4", icon: "instagram" },
      ],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFooter((prev: any) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_: any, i: number) => i !== index),
    }));
  };

  // --- Footer Badges Helpers ---
  const addBadge = () => {
    setFooter((prev: any) => ({
      ...prev,
      badges: [
        ...(prev.badges || []),
        {
          label: "Certified Partner",
          imageUrl: "/images/badge.svg",
          linkUrl: "",
        },
      ],
    }));
  };

  const removeBadge = (index: number) => {
    setFooter((prev: any) => ({
      ...prev,
      badges: prev.badges.filter((_: any, i: number) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings & Navigation</h1>
          <p className="text-sm text-muted-foreground">
            Configure header mega-menus, top promo banner, logo branding, and footer sections.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="header" className="gap-2">
            <Menu className="h-4 w-4" />
            <span>Header & Menu</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <PanelBottom className="h-4 w-4" />
            <span>Footer & Branding</span>
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* TAB 1: HEADER BUILDER */}
        {/* ======================================================== */}
        <TabsContent value="header" className="space-y-6">
          {/* Announcement Bar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Top Announcement Banner</CardTitle>
                  <CardDescription>
                    Promote special discounts, monsoon trek alerts, or seasonal notices.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="announce-toggle" className="text-xs font-normal">
                    {header.announcement?.enabled ? "Active" : "Disabled"}
                  </Label>
                  <Switch
                    id="announce-toggle"
                    checked={header.announcement?.enabled}
                    onCheckedChange={(checked) =>
                      setHeader((prev: any) => ({
                        ...prev,
                        announcement: { ...prev.announcement, enabled: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {header.announcement?.enabled && (
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Banner Announcement Text</Label>
                    <Input
                      value={header.announcement?.text || ""}
                      onChange={(e) =>
                        setHeader((prev: any) => ({
                          ...prev,
                          announcement: { ...prev.announcement, text: e.target.value },
                        }))
                      }
                      placeholder="e.g. Early Bird 15% off for upcoming Himalayan batches!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Label</Label>
                    <Input
                      value={header.announcement?.badge || ""}
                      onChange={(e) =>
                        setHeader((prev: any) => ({
                          ...prev,
                          announcement: { ...prev.announcement, badge: e.target.value },
                        }))
                      }
                      placeholder="e.g. New Season"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Link Destination URL</Label>
                  <Input
                    value={header.announcement?.linkUrl || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({
                        ...prev,
                        announcement: { ...prev.announcement, linkUrl: e.target.value },
                      }))
                    }
                    placeholder="/programs?season=monsoon"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Logo & Brand Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand Logo & Identity</CardTitle>
              <CardDescription>Displayed in the sticky navigation header.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Display Name</Label>
                  <Input
                    value={header.logoText || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({ ...prev, logoText: e.target.value }))
                    }
                    placeholder="Rope4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Tagline</Label>
                  <Input
                    value={header.tagline || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({ ...prev, tagline: e.target.value }))
                    }
                    placeholder="Outdoor Education & Adventure"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo Image</Label>
                <UploadFiles
                  folder="branding"
                  value={header.logoUrl || ""}
                  onChange={(url) =>
                    setHeader((prev: any) => ({ ...prev, logoUrl: url as string }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact & Action CTA Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Contact & Header CTA Button</CardTitle>
              <CardDescription>
                Phone numbers and primary action button (e.g. &apos;Plan Trek&apos;).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Hotline Phone</Label>
                  <Input
                    value={header.quickContact?.phone || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({
                        ...prev,
                        quickContact: { ...prev.quickContact, phone: e.target.value },
                      }))
                    }
                    placeholder="+880 1711 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    value={header.quickContact?.email || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({
                        ...prev,
                        quickContact: { ...prev.quickContact, email: e.target.value },
                      }))
                    }
                    placeholder="adventure@rope4.org"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Physical Office Address</Label>
                  <Input
                    value={header.quickContact?.address || ""}
                    onChange={(e) =>
                      setHeader((prev: any) => ({
                        ...prev,
                        quickContact: { ...prev.quickContact, address: e.target.value },
                      }))
                    }
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-semibold text-sm">Action CTA Button</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cta-toggle" className="text-xs font-normal">
                      {header.ctaButton?.isVisible ? "Visible" : "Hidden"}
                    </Label>
                    <Switch
                      id="cta-toggle"
                      checked={header.ctaButton?.isVisible}
                      onCheckedChange={(checked) =>
                        setHeader((prev: any) => ({
                          ...prev,
                          ctaButton: { ...prev.ctaButton, isVisible: checked },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Label</Label>
                    <Input
                      value={header.ctaButton?.label || ""}
                      onChange={(e) =>
                        setHeader((prev: any) => ({
                          ...prev,
                          ctaButton: { ...prev.ctaButton, label: e.target.value },
                        }))
                      }
                      placeholder="Plan Adventure"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target URL</Label>
                    <Input
                      value={header.ctaButton?.url || ""}
                      onChange={(e) =>
                        setHeader((prev: any) => ({
                          ...prev,
                          ctaButton: { ...prev.ctaButton, url: e.target.value },
                        }))
                      }
                      placeholder="/programs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Items Repeater */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Navigation Menu Items</CardTitle>
                <CardDescription>
                  Reorder and configure header menu links, dropdowns, and mega-menus.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addNavItem} className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Nav Link</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(header.navItems || []).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                  <p>No navigation items defined.</p>
                  <Button type="button" variant="link" onClick={addNavItem}>
                    Add your first menu item
                  </Button>
                </div>
              ) : (
                header.navItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border bg-muted/20 space-y-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-sm">{item.label || "Untitled Link"}</span>
                        {item.isMegaMenu && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                            Mega Menu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Mega Menu Dropdown</Label>
                          <Switch
                            checked={item.isMegaMenu}
                            onCheckedChange={(checked) =>
                              updateNavItem(idx, { isMegaMenu: checked })
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNavItem(idx)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Menu Label</Label>
                        <Input
                          value={item.label}
                          onChange={(e) => updateNavItem(idx, { label: e.target.value })}
                          placeholder="e.g. Choose Trek"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Destination URL</Label>
                        <Input
                          value={item.href}
                          onChange={(e) => updateNavItem(idx, { href: e.target.value })}
                          placeholder="e.g. /programs"
                        />
                      </div>
                    </div>

                    {/* Simple Sub-menu children */}
                    {!item.isMegaMenu && (
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Sub-links (Dropdown Items)
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addNavChild(idx)}
                            className="h-7 text-xs text-primary"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Dropdown Link
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(item.children || []).map((child: any, cIdx: number) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <Input
                                value={child.label}
                                onChange={(e) => {
                                  const updatedChildren = [...item.children];
                                  updatedChildren[cIdx].label = e.target.value;
                                  updateNavItem(idx, { children: updatedChildren });
                                }}
                                placeholder="Sub-link label"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={child.href}
                                onChange={(e) => {
                                  const updatedChildren = [...item.children];
                                  updatedChildren[cIdx].href = e.target.value;
                                  updateNavItem(idx, { children: updatedChildren });
                                }}
                                placeholder="/path"
                                className="h-8 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeNavChild(idx, cIdx)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: FOOTER BUILDER */}
        {/* ======================================================== */}
        <TabsContent value="footer" className="space-y-6">
          {/* About & Copyright */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Company Blurb & Legal</CardTitle>
              <CardDescription>Displayed in the main footer column.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>About Rope4 Mission Blurb</Label>
                <Textarea
                  rows={3}
                  value={footer.aboutText || ""}
                  onChange={(e) =>
                    setFooter((prev: any) => ({ ...prev, aboutText: e.target.value }))
                  }
                  placeholder="Rope4 provides world-class outdoor education and adventure travel experiences..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Copyright Line</Label>
                  <Input
                    value={footer.copyright || ""}
                    onChange={(e) =>
                      setFooter((prev: any) => ({ ...prev, copyright: e.target.value }))
                    }
                    placeholder="© 2026 Rope4. All rights reserved."
                  />
                </div>
                <div className="space-y-2">
                  <Label>24/7 Emergency Mountain Line</Label>
                  <Input
                    value={footer.emergencyHotline || ""}
                    onChange={(e) =>
                      setFooter((prev: any) => ({
                        ...prev,
                        emergencyHotline: e.target.value,
                      }))
                    }
                    placeholder="+880 1800 ROPE4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Link Columns Repeater */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Footer Navigation Columns</CardTitle>
                <CardDescription>
                  Group links by category (e.g. &apos;Expeditions&apos;, &apos;Learning&apos;, &apos;Company&apos;).
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFooterColumn} className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Column</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {(footer.columns || []).map((col: any, colIdx: number) => (
                <div
                  key={colIdx}
                  className="p-4 rounded-lg border border-border bg-muted/20 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 max-w-sm space-y-1">
                      <Label className="text-xs">Column Section Title</Label>
                      <Input
                        value={col.title}
                        onChange={(e) => {
                          const updated = [...footer.columns];
                          updated[colIdx].title = e.target.value;
                          setFooter((prev: any) => ({ ...prev, columns: updated }));
                        }}
                        placeholder="e.g. Himalayan Treks"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFooterColumn(colIdx)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Links inside column */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Column Links</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addFooterLink(colIdx)}
                        className="h-7 text-xs text-primary"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Link
                      </Button>
                    </div>

                    {(col.links || []).map((link: any, linkIdx: number) => (
                      <div key={linkIdx} className="flex items-center gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...footer.columns];
                            updated[colIdx].links[linkIdx].label = e.target.value;
                            setFooter((prev: any) => ({ ...prev, columns: updated }));
                          }}
                          placeholder="Link Text"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...footer.columns];
                            updated[colIdx].links[linkIdx].url = e.target.value;
                            setFooter((prev: any) => ({ ...prev, columns: updated }));
                          }}
                          placeholder="/path"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFooterLink(colIdx, linkIdx)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Social Media Profiles</CardTitle>
                <CardDescription>Facebook, Instagram, YouTube, LinkedIn links.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Social Link</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(footer.socialLinks || []).map((social: any, sIdx: number) => (
                <div key={sIdx} className="flex items-center gap-3">
                  <Input
                    value={social.platform}
                    onChange={(e) => {
                      const updated = [...footer.socialLinks];
                      updated[sIdx].platform = e.target.value;
                      setFooter((prev: any) => ({ ...prev, socialLinks: updated }));
                    }}
                    placeholder="Platform (e.g. Facebook)"
                    className="w-1/3"
                  />
                  <Input
                    value={social.url}
                    onChange={(e) => {
                      const updated = [...footer.socialLinks];
                      updated[sIdx].url = e.target.value;
                      setFooter((prev: any) => ({ ...prev, socialLinks: updated }));
                    }}
                    placeholder="Profile URL"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocialLink(sIdx)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trust & Accreditation Badges */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Trust & Accreditation Badges</CardTitle>
                <CardDescription>Mountaineering affiliations, Leave No Trace, Eco certification.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addBadge} className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Badge</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(footer.badges || []).map((badge: any, bIdx: number) => (
                <div key={bIdx} className="p-3 border rounded-lg flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={badge.label}
                      onChange={(e) => {
                        const updated = [...footer.badges];
                        updated[bIdx].label = e.target.value;
                        setFooter((prev: any) => ({ ...prev, badges: updated }));
                      }}
                      placeholder="Badge Title (e.g. Leave No Trace Partner)"
                    />
                    <Input
                      value={badge.imageUrl}
                      onChange={(e) => {
                        const updated = [...footer.badges];
                        updated[bIdx].imageUrl = e.target.value;
                        setFooter((prev: any) => ({ ...prev, badges: updated }));
                      }}
                      placeholder="Badge Image URL"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBadge(bIdx)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
