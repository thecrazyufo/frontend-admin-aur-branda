"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { AdminSocialProofAPI } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";

type Tab = "logos" | "testimonials";

export default function SocialProofPage() {
  const params = useParams();
  const brandId = params?.brandId as string;

  const [activeTab, setActiveTab] = useState<Tab>("logos");
  
  const [logos, setLogos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Logo Form
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Testimonial Form
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  useEffect(() => {
    if (brandId) {
      fetchData();
    }
  }, [brandId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [l, t] = await Promise.all([
        AdminSocialProofAPI.getLogos(),
        AdminSocialProofAPI.getTestimonials()
      ]);
      setLogos(l);
      setTestimonials(t);
    } catch (e) {
      console.error("Failed to fetch social proof", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLogo(e: FormEvent) {
    e.preventDefault();
    if (editingLogo.id) {
      await AdminSocialProofAPI.updateLogo(editingLogo.id, editingLogo);
    } else {
      await AdminSocialProofAPI.createLogo(editingLogo);
    }
    setIsLogoModalOpen(false);
    fetchData();
  }

  async function handleDeleteLogo(id: string) {
    if (confirm("Are you sure?")) {
      await AdminSocialProofAPI.deleteLogo(id);
      fetchData();
    }
  }

  async function handleSaveTestimonial(e: FormEvent) {
    e.preventDefault();
    if (editingTestimonial.id) {
      await AdminSocialProofAPI.updateTestimonial(editingTestimonial.id, editingTestimonial);
    } else {
      await AdminSocialProofAPI.createTestimonial(editingTestimonial);
    }
    setIsTestimonialModalOpen(false);
    fetchData();
  }

  async function handleDeleteTestimonial(id: string) {
    if (confirm("Are you sure?")) {
      await AdminSocialProofAPI.deleteTestimonial(id);
      fetchData();
    }
  }

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading social proof data...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Proof Management</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage customer logos and testimonials for {brandId}.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[--border]">
        <button 
          onClick={() => setActiveTab("logos")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "logos" ? "border-primary text-foreground" : "border-transparent text-zinc-500 hover:text-foreground"}`}
        >
          Client Logos
        </button>
        <button 
          onClick={() => setActiveTab("testimonials")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "testimonials" ? "border-primary text-foreground" : "border-transparent text-zinc-500 hover:text-foreground"}`}
        >
          Testimonials
        </button>
      </div>

      {activeTab === "logos" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Client Logos</CardTitle>
              <CardDescription>Manage logos shown in the marquee strip.</CardDescription>
            </div>
            <Button onClick={() => {
              setEditingLogo({ companyName: "", logoUrl: "", displayOrder: 0 });
              setIsLogoModalOpen(true);
            }}>Add Logo</Button>
          </CardHeader>
          <CardContent>
            {logos.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm border border-dashed border-[--border] rounded-lg">No logos found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logos.map(l => (
                    <TableRow key={l.id}>
                      <TableCell><img src={l.logoUrl} alt={l.companyName} className="h-8 max-w-[100px] object-contain bg-zinc-100 p-1 rounded" /></TableCell>
                      <TableCell>{l.companyName}</TableCell>
                      <TableCell>{l.displayOrder}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingLogo(l); setIsLogoModalOpen(true); }}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteLogo(l.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "testimonials" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>Manage customer reviews and feedback.</CardDescription>
            </div>
            <Button onClick={() => {
              setEditingTestimonial({ authorName: "", authorTitle: "", company: "", content: "", rating: 5, avatarUrl: "", isFeatured: false });
              setIsTestimonialModalOpen(true);
            }}>Add Testimonial</Button>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm border border-dashed border-[--border] rounded-lg">No testimonials found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map(t => (
                  <Card key={t.id} className="bg-zinc-50 dark:bg-zinc-900/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {t.avatarUrl ? (
                            <img src={t.avatarUrl} alt={t.authorName} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                              {t.authorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm">{t.authorName}</div>
                            <div className="text-xs text-zinc-500">{t.authorTitle} {t.company && `at ${t.company}`}</div>
                          </div>
                        </div>
                        <div className="flex text-yellow-500 text-xs">
                          {Array.from({length: t.rating}).map((_,i) => <span key={i}>★</span>)}
                        </div>
                      </div>
                      <p className="text-sm italic text-zinc-600 dark:text-zinc-400">"{t.content}"</p>
                      <div className="flex justify-end space-x-2 pt-2 border-t border-[--border]">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingTestimonial(t); setIsTestimonialModalOpen(true); }}>Edit</Button>
                        <Button variant="ghost" className="text-red-500" size="sm" onClick={() => handleDeleteTestimonial(t.id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logo Modal */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[--border]">
              <h2 className="text-lg font-semibold">{editingLogo.id ? "Edit Logo" : "Add Logo"}</h2>
            </div>
            <form onSubmit={handleSaveLogo} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input required value={editingLogo.companyName} onChange={e => setEditingLogo({...editingLogo, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (SVG/PNG)</label>
                <Input required value={editingLogo.logoUrl} onChange={e => setEditingLogo({...editingLogo, logoUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" required value={editingLogo.displayOrder} onChange={e => setEditingLogo({...editingLogo, displayOrder: parseInt(e.target.value)})} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsLogoModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[--border]">
              <h2 className="text-lg font-semibold">{editingTestimonial.id ? "Edit Testimonial" : "Add Testimonial"}</h2>
            </div>
            <form onSubmit={handleSaveTestimonial} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author Name</label>
                  <Input required value={editingTestimonial.authorName} onChange={e => setEditingTestimonial({...editingTestimonial, authorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Avatar URL</label>
                  <Input value={editingTestimonial.avatarUrl} onChange={e => setEditingTestimonial({...editingTestimonial, avatarUrl: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author Title</label>
                  <Input value={editingTestimonial.authorTitle} onChange={e => setEditingTestimonial({...editingTestimonial, authorTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input value={editingTestimonial.company} onChange={e => setEditingTestimonial({...editingTestimonial, company: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea 
                  required
                  className="w-full flex min-h-[100px] rounded-md border border-[--border] bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  value={editingTestimonial.content} 
                  onChange={e => setEditingTestimonial({...editingTestimonial, content: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input type="number" min="1" max="5" required value={editingTestimonial.rating} onChange={e => setEditingTestimonial({...editingTestimonial, rating: parseInt(e.target.value)})} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsTestimonialModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
