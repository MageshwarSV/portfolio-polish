import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, checkSessionExpiry, getSessionInfo } from '@/lib/adminAuth';
import {
  getExperiences, saveExperiences,
  getProjects, saveProjects,
  getSkills, saveSkills,
  getAboutContent, saveAboutContent,
  getPersonalInfo, savePersonalInfo,
  getCertifications, saveCertifications,
  getAchievements, saveAchievements,
  getContactInfo, saveContactInfo,
  getSocials, saveSocials,
  getChapters, saveChapters,
  getTechStack, saveTechStack,
  initializeData,
  deleteAllData
} from '@/lib/portfolioData';
import { getThemeSettings, saveThemeSettings, defaultThemeSettings, ThemeSettings, applyTheme, resetThemeSettings, getCustomPresets, saveCustomPreset, deleteCustomPreset, CustomPreset } from '@/lib/themeSettings';
import { Briefcase, FolderGit2, Code2, User, Settings, LogOut, Plus, Trash2, Save, Star, Award, Trophy, Link2, Mail, Scissors, RefreshCw, Cloud, Wifi, Clock, Palette, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'experiences' | 'projects' | 'skills' | 'about' | 'personal' | 'certifications' | 'contact' | 'navigation' | 'appearance'>('experiences');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [about, setAbout] = useState<any>({});
  const [personal, setPersonal] = useState<any>({});
  const [certifications, setCertifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Image Cropping State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>('');

  // Theme Settings State
  const [themeSettings, setThemeSettings] = useState<any>(null);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  useEffect(() => {
    document.body.classList.add('admin-panel');

    // Check session expiry first
    checkSessionExpiry();

    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }

    // CRITICAL: We must await initializeData to ensure defaults are pushed to
    // Firebase BEFORE loadData reads from it. Otherwise the panel shows empty.
    const initAndLoad = async () => {
      await initializeData();
      await loadData();
    };
    initAndLoad();

    // Session expiry timer - check every minute
    const sessionTimer = setInterval(() => {
      checkSessionExpiry();
      if (!isAuthenticated()) {
        navigate('/admin');
        return;
      }

      // Update time left display
      const session = getSessionInfo();
      if (session) {
        const timeLeft = session.expiryTime - Date.now();
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60000);
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          setSessionTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
        }
      }
    }, 60000);

    // Initial time left calculation
    const session = getSessionInfo();
    if (session) {
      const timeLeft = session.expiryTime - Date.now();
      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setSessionTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
      }
    }

    return () => {
      document.body.classList.remove('admin-panel');
      clearInterval(sessionTimer);
    };
  }, [navigate]);

  const loadData = async () => {
    setExperiences(await getExperiences());
    setProjects(await getProjects());
    setSkills(await getSkills());
    setAbout(await getAboutContent());
    setPersonal(await getPersonalInfo());
    setCertifications(await getCertifications());
    setAchievements(await getAchievements());
    setContactInfo(await getContactInfo());
    setSocials(await getSocials());
    setChapters(await getChapters());
    setTechStack(await getTechStack());
    setThemeSettings(await getThemeSettings());
    setCustomPresets(await getCustomPresets());
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Set update timestamp to trigger storage event for the portfolio site
    localStorage.setItem('portfolio_last_update', Date.now().toString());

    // Trigger custom event for same-tab updates (for portfolio site)
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));

    // NOTE: We intentionally do NOT call loadData() here.
    // The React state already has the user's edits, and calling loadData()
    // can cause a race condition where stale cached data overwrites
    // the just-saved changes. The portfolio site uses real-time listeners
    // to pick up changes independently.
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await initializeData();
      await loadData();
      showSavedMessage();
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Experience Management
  const addExperience = () => {
    const currentYear = new Date().getFullYear();

    // Mark all previous "Present" experiences as completed with current year
    const updatedExperiences = experiences.map((exp: any) => {
      if (exp.period?.includes('Present')) {
        // Replace "Present" with current year
        const updatedPeriod = exp.period.replace('Present', currentYear.toString());
        return { ...exp, period: updatedPeriod, type: 'completed' };
      }
      return exp;
    });

    const maxId = experiences.length > 0 ? Math.max(...experiences.map((e: any) => e.id || 0)) : 0;
    const newExp = {
      id: maxId + 1,
      title: 'New Role',
      company: 'Company Name',
      period: `${currentYear} - Present`,
      type: 'current',
      description: 'Role description',
      highlights: ['Achievement 1', 'Achievement 2', 'Achievement 3'],
      color: 'primary'
    };

    // Add new experience at the beginning (most recent first)
    setExperiences([newExp, ...updatedExperiences]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const deleteExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const saveExperiencesData = async () => {
    await saveExperiences(experiences);
    showSavedMessage();
  };

  // Project Management
  const addProject = () => {
    const maxId = projects.length > 0 ? Math.max(...projects.map((p: any) => p.id || 0)) : 0;
    const newProject = {
      id: maxId + 1,
      title: 'New Project',
      subtitle: 'Project Subtitle',
      description: 'Project description goes here',
      tags: ['Tag1', 'Tag2'],
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      color: 'primary',
      featured: false,
      category: 'web'
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const deleteProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const saveProjectsData = async () => {
    await saveProjects(projects);
    showSavedMessage();
  };

  // Skill Management (with categories)
  const addSkillToCategory = (categoryIndex: number) => {
    const newSkill = {
      name: 'New Skill',
      level: 70,
      icon: '💻'
    };
    const updated = [...skills];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      skills: [...updated[categoryIndex].skills, newSkill]
    };
    setSkills(updated);
  };

  const updateSkillInCategory = (categoryIndex: number, skillIndex: number, field: string, value: any) => {
    const updated = [...skills];
    updated[categoryIndex].skills[skillIndex] = {
      ...updated[categoryIndex].skills[skillIndex],
      [field]: value
    };
    setSkills(updated);
  };

  const deleteSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const updated = [...skills];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      skills: updated[categoryIndex].skills.filter((_: any, i: number) => i !== skillIndex)
    };
    setSkills(updated);
  };

  const saveSkillsData = async () => {
    await saveSkills(skills);
    showSavedMessage();
  };

  // Certifications functions
  const addCertification = () => {
    setCertifications([...certifications, { title: '', issuer: '', year: new Date().getFullYear() }]);
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const deleteCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const saveCertificationsData = async () => {
    await saveCertifications(certifications);
    await saveAchievements(achievements);
    showSavedMessage();
  };

  // Achievements functions
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', issuer: '', year: new Date().getFullYear() }]);
  };

  const updateAchievement = (index: number, field: string, value: any) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const deleteAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // Contact Info functions
  const addContactInfo = () => {
    setContactInfo([...contactInfo, { label: '', value: '', href: '' }]);
  };

  const updateContactInfo = (index: number, field: string, value: any) => {
    const updated = [...contactInfo];
    updated[index] = { ...updated[index], [field]: value };
    setContactInfo(updated);
  };

  const deleteContactInfo = (index: number) => {
    setContactInfo(contactInfo.filter((_, i) => i !== index));
  };

  // Socials functions
  const addSocial = () => {
    setSocials([...socials, { label: '', href: '', icon: 'Globe' }]);
  };

  const updateSocial = (index: number, field: string, value: any) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const deleteSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const saveContactData = async () => {
    await saveContactInfo(contactInfo);
    await saveSocials(socials);
    showSavedMessage();
  };

  // Chapters functions
  const addChapter = () => {
    const maxNumber = chapters.length > 0 ? Math.max(...chapters.map((c: any) => parseInt(c.number))) : -1;
    setChapters([...chapters, { id: '', label: '', number: String(maxNumber + 1).padStart(2, '0') }]);
  };

  const updateChapter = (index: number, field: string, value: any) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  const deleteChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const saveChaptersData = async () => {
    await saveChapters(chapters);
    showSavedMessage();
  };

  // Tech Stack functions
  const addTech = () => {
    setTechStack([...techStack, '']);
  };

  const updateTech = (index: number, value: string) => {
    const updated = [...techStack];
    updated[index] = value;
    setTechStack(updated);
  };

  const deleteTech = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const saveTechStackData = async () => {
    await saveTechStack(techStack);
    showSavedMessage();
  };

  // Delete all data
  const handleDeleteAllData = async () => {
    if (confirm('Are you sure you want to delete ALL portfolio data? This cannot be undone!')) {
      await deleteAllData();
      alert('All data deleted. Page will reload.');
      window.location.reload();
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleApplyCrop = async () => {
    try {
      if (imageToCrop && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        if (croppedImage) {
          const updatedPersonal = { ...personal, profileImage: croppedImage };
          setPersonal(updatedPersonal);

          // Save immediately to live site
          await savePersonalInfo(updatedPersonal);
          showSavedMessage();

          setIsCropModalOpen(false);
          setImageToCrop(null);
        }
      }
    } catch (e) {
      console.error("Error cropping image:", e);
      alert("Failed to crop image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Portfolio Management</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Force Cloud Sync"}
            </button>
            {sessionTimeLeft && (
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Session: {sessionTimeLeft}</span>
              </div>
            )}
            <a href="/" target="_blank" className="text-sm text-primary hover:underline">
              View Live Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Save Notification */}
        {saved && (
          <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            ✓ Changes saved successfully!
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'experiences', label: 'Experiences', icon: Briefcase },
            { id: 'projects', label: 'Projects', icon: FolderGit2 },
            { id: 'skills', label: 'Skills', icon: Code2 },
            { id: 'certifications', label: 'Certifications & Awards', icon: Award },
            { id: 'contact', label: 'Contact & Social', icon: Link2 },
            { id: 'navigation', label: 'Navigation', icon: Settings },
            { id: 'about', label: 'About', icon: User },
            { id: 'personal', label: 'Personal Info', icon: Settings },
            { id: 'appearance', label: 'Appearance', icon: Palette }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Work Experiences</h2>
                <p className="text-sm text-muted-foreground">Manage your career timeline</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
                <button
                  onClick={saveExperiencesData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90"
                >
                  <Save className="w-4 h-4" />
                  Save All
                </button>
              </div>
            </div>

            {experiences.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No experiences yet. Add your first work experience!</p>
                <button
                  onClick={addExperience}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add First Experience
                </button>
              </div>
            )}

            {experiences.map((exp, index) => (
              <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${exp.color === 'accent' ? 'bg-accent/20' : 'bg-primary/20'
                        }`}>
                        <Briefcase className={`w-5 h-5 ${exp.color === 'accent' ? 'text-accent' : 'text-primary'
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {exp.title || 'Untitled Role'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {exp.company || 'Company Name'} • {exp.period || 'Period'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${exp.period?.includes('Present')
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                      }`}>
                      {exp.period?.includes('Present') ? '● Active' : '○ Completed'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Job Title *</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Company *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        placeholder="Tech Company Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Period * <span className="text-xs text-muted-foreground/60">(Use "Present" for current role)</span>
                      </label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateExperience(index, 'period', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        placeholder="2023 - Present"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Theme Color</label>
                      <select
                        value={exp.color || 'primary'}
                        onChange={(e) => updateExperience(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      >
                        <option value="primary">Primary (Blue)</option>
                        <option value="accent">Accent (Purple)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Short Description</label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground min-h-[60px]"
                      placeholder="Brief role description..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Key Highlights/Achievements <span className="text-xs text-muted-foreground/60">(One per line)</span>
                    </label>
                    <textarea
                      value={exp.highlights?.join('\n') || ''}
                      onChange={(e) => updateExperience(index, 'highlights', e.target.value.split('\n').filter(h => h.trim()))}
                      rows={5}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono text-sm"
                      placeholder="Led development team of 5 engineers&#10;Increased system performance by 40%&#10;Implemented CI/CD pipeline"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteExperience(index)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Projects Portfolio</h2>
                <p className="text-sm text-muted-foreground">Showcase your best work</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addProject}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
                <button
                  onClick={saveProjectsData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90"
                >
                  <Save className="w-4 h-4" />
                  Save All
                </button>
              </div>
            </div>

            {projects.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No projects yet. Add your first project!</p>
                <button
                  onClick={addProject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add First Project
                </button>
              </div>
            )}

            {projects.map((project, index) => (
              <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Header with Featured Badge */}
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.color === 'accent' ? 'bg-accent/20' : 'bg-primary/20'
                        }`}>
                        <FolderGit2 className={`w-5 h-5 ${project.color === 'accent' ? 'text-accent' : 'text-primary'
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {project.title || 'Untitled Project'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.category || 'web'} • {project.tags?.length || 0} tags
                        </p>
                      </div>
                    </div>
                    {project.featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Project Image Upload */}
                  <div className="mb-6 p-4 bg-background border border-border rounded-lg">
                    <label className="block text-sm font-medium text-foreground mb-3">Project Image</label>
                    <div className="flex flex-col gap-4">
                      {project.image && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 3 * 1024 * 1024) {
                              alert('Image size should be less than 3MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateProject(index, 'image', reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">Max 3MB. Recommended: 1200x600px</p>
                      {project.image && (
                        <button
                          onClick={() => updateProject(index, 'image', '')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm w-fit"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Project Title *</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        placeholder="AGRISENSE"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={project.subtitle || ''}
                        onChange={(e) => updateProject(index, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        placeholder="Smart Agriculture System"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Description *</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      placeholder="Detailed project description..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Tags <span className="text-xs text-muted-foreground/60">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={project.tags?.join(', ') || ''}
                      onChange={(e) => updateProject(index, 'tags', e.target.value.split(',').map((t: string) => t.trim()).filter(t => t))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      placeholder="IoT, ESP8266, Sensors, Cloud"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Key Features <span className="text-xs text-muted-foreground/60">(One per line)</span>
                    </label>
                    <textarea
                      value={project.features?.join('\n') || ''}
                      onChange={(e) => updateProject(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                      rows={4}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono text-sm"
                      placeholder="Real-time monitoring&#10;Automatic irrigation&#10;Cloud dashboard"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Theme Color</label>
                      <select
                        value={project.color || 'primary'}
                        onChange={(e) => updateProject(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      >
                        <option value="primary">Primary (Blue)</option>
                        <option value="accent">Accent (Purple)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Category *</label>
                      <select
                        value={project.category || 'web'}
                        onChange={(e) => updateProject(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      >
                        <option value="ai">🤖 AI & Automation</option>
                        <option value="iot">📡 IoT</option>
                        <option value="web">🌐 Web</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Display Options</label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg cursor-pointer hover:bg-background/80">
                        <input
                          type="checkbox"
                          checked={project.featured || false}
                          onChange={(e) => updateProject(index, 'featured', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-foreground">Featured Project</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <button
                      onClick={() => deleteProject(index)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Skills Management</h2>
                <p className="text-sm text-muted-foreground mt-1">Organize your technical skills by category</p>
              </div>
              <button
                onClick={saveSkillsData}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Skill Categories</h3>
                <p className="text-muted-foreground">Skills will be organized by categories</p>
              </div>
            ) : (
              skills.map((category: any, catIndex: number) => (
                <div key={catIndex} className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center text-2xl shadow-md">
                          {category.skills[0]?.icon || '💻'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                              {category.skills.length} {category.skills.length === 1 ? 'Skill' : 'Skills'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addSkillToCategory(catIndex)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                      >
                        <Plus className="w-4 h-4" />
                        Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="p-5">
                    {category.skills.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No skills in this category yet.</p>
                        <p className="text-xs mt-1">Click "Add Skill" to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.skills.map((skill: any, skillIndex: number) => (
                          <div key={skillIndex} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            {/* Skill Icon & Name */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="text-2xl">{skill.icon}</div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => updateSkillInCategory(catIndex, skillIndex, 'name', e.target.value)}
                                  placeholder="Skill name"
                                  className="w-full px-2 py-1 bg-transparent border-b border-transparent hover:border-border focus:border-primary text-foreground font-medium text-sm outline-none transition-colors"
                                />
                              </div>
                            </div>

                            {/* Icon Input */}
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Icon Emoji
                              </label>
                              <input
                                type="text"
                                value={skill.icon}
                                onChange={(e) => updateSkillInCategory(catIndex, skillIndex, 'icon', e.target.value)}
                                placeholder="💻"
                                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                              />
                            </div>

                            {/* Level Slider */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Proficiency Level
                                </label>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {skill.level}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={skill.level}
                                onChange={(e) => updateSkillInCategory(catIndex, skillIndex, 'level', parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
                                style={{
                                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${skill.level}%, hsl(var(--muted)) ${skill.level}%, hsl(var(--muted)) 100%)`
                                }}
                              />
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted-foreground">Beginner</span>
                                <span className="text-xs text-muted-foreground">Expert</span>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => deleteSkillFromCategory(catIndex, skillIndex)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 w-full justify-center text-sm font-medium transition-colors border-t border-border pt-4 mt-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Skill
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Certifications & Achievements Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Certifications & Achievements</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your credentials and awards</p>
              </div>
              <button
                onClick={saveCertificationsData}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
            </div>

            {/* Certifications Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Certifications</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                          {certifications.length} {certifications.length === 1 ? 'Certificate' : 'Certificates'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </button>
                </div>
              </div>

              <div className="p-5">
                {certifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No certifications added yet.</p>
                    <p className="text-xs mt-1">Click "Add Certification" to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certifications.map((cert: any, index: number) => (
                      <div key={index} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Certificate Title
                            </label>
                            <input
                              type="text"
                              value={cert.title}
                              onChange={(e) => updateCertification(index, 'title', e.target.value)}
                              placeholder="Python Programming"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Issuing Organization
                            </label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                              placeholder="GUVI"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Year Obtained
                            </label>
                            <input
                              type="number"
                              value={cert.year}
                              onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value))}
                              min="2000"
                              max="2030"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                          </div>

                          <button
                            onClick={() => deleteCertification(index)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 w-full justify-center text-sm font-medium transition-colors border-t border-border pt-3 mt-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Certificate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Achievements Unlocked</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                          {achievements.length} {achievements.length === 1 ? 'Achievement' : 'Achievements'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={addAchievement}
                    className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-yellow-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Achievement
                  </button>
                </div>
              </div>

              <div className="p-5">
                {achievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No achievements added yet.</p>
                    <p className="text-xs mt-1">Click "Add Achievement" to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement: any, index: number) => (
                      <div key={index} className="bg-background border border-border rounded-lg p-4 hover:border-yellow-500/50 transition-colors">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Achievement Title
                            </label>
                            <input
                              type="text"
                              value={achievement.title}
                              onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                              placeholder="Project Expo - 1st Place"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Organization / Event
                            </label>
                            <input
                              type="text"
                              value={achievement.issuer}
                              onChange={(e) => updateAchievement(index, 'issuer', e.target.value)}
                              placeholder="Kings Engineering College"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Year Awarded
                            </label>
                            <input
                              type="number"
                              value={achievement.year}
                              onChange={(e) => updateAchievement(index, 'year', parseInt(e.target.value))}
                              min="2000"
                              max="2030"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                          </div>

                          <button
                            onClick={() => deleteAchievement(index)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 w-full justify-center text-sm font-medium transition-colors border-t border-border pt-3 mt-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Achievement
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact & Social Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Contact & Social Links</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage contact information and social media links</p>
              </div>
              <button
                onClick={saveContactData}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
            </div>

            {/* Contact Information Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Contact Information</h3>
                      <p className="text-sm text-muted-foreground">Email, Phone, Location, etc.</p>
                    </div>
                  </div>
                  <button
                    onClick={addContactInfo}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </button>
                </div>
              </div>

              <div className="p-5">
                {contactInfo.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No contact information added yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Label</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Value</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Link (href)</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactInfo.map((contact: any, index: number) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={contact.label}
                                onChange={(e) => updateContactInfo(index, 'label', e.target.value)}
                                placeholder="Email"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={contact.value}
                                onChange={(e) => updateContactInfo(index, 'value', e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={contact.href || ''}
                                onChange={(e) => updateContactInfo(index, 'href', e.target.value)}
                                placeholder="mailto:example@email.com"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteContactInfo(index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Link2 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Social Media Links</h3>
                      <p className="text-sm text-muted-foreground">GitHub, LinkedIn, Twitter, etc.</p>
                    </div>
                  </div>
                  <button
                    onClick={addSocial}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Social Link
                  </button>
                </div>
              </div>

              <div className="p-5">
                {socials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No social links added yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 text-left">
                          <th className="py-3 px-4 font-semibold text-sm rounded-tl-lg">Label</th>
                          <th className="py-3 px-4 font-semibold text-sm">Platform / Icon</th>
                          <th className="py-3 px-4 font-semibold text-sm">URL</th>
                          <th className="py-3 px-4 font-semibold text-sm text-center rounded-tr-lg w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {socials.map((social: any, index: number) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={social.label}
                                onChange={(e) => updateSocial(index, 'label', e.target.value)}
                                placeholder="GitHub"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={social.icon || 'Globe'}
                                onChange={(e) => updateSocial(index, 'icon', e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                              >
                                <option value="Github">GitHub</option>
                                <option value="Linkedin">LinkedIn</option>
                                <option value="Twitter">Twitter</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Youtube">YouTube</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Mail">Mail</option>
                                <option value="Phone">Phone</option>
                                <option value="Globe">Website (Globe)</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="url"
                                value={social.href}
                                onChange={(e) => updateSocial(index, 'href', e.target.value)}
                                placeholder="https://github.com/username"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteSocial(index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Navigation Menu</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure the navigation menu items and scroll sections</p>
              </div>
              <button
                onClick={() => { saveChaptersData(); saveTechStackData(); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Settings className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Navigation Chapters</h3>
                      <p className="text-sm text-muted-foreground">Menu items that appear in the navigation bar</p>
                    </div>
                  </div>
                  <button
                    onClick={addChapter}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Chapter
                  </button>
                </div>
              </div>

              <div className="p-5">
                {chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No navigation items added yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Number</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Section ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Label</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chapters.map((chapter: any, index: number) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={chapter.number}
                                onChange={(e) => updateChapter(index, 'number', e.target.value)}
                                placeholder="00"
                                className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-center font-mono"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={chapter.id}
                                onChange={(e) => updateChapter(index, 'id', e.target.value)}
                                placeholder="hero"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={chapter.label}
                                onChange={(e) => updateChapter(index, 'label', e.target.value)}
                                placeholder="Home"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteChapter(index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-500 text-xs font-bold">ℹ</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How it works:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li><strong>Number:</strong> Display order (00, 01, 02...)</li>
                      <li><strong>Section ID:</strong> Must match the section id attribute in the page (e.g., "hero", "about", "experience")</li>
                      <li><strong>Label:</strong> Text shown in the navigation menu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center shadow-md">
                      <Code2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Tech Stack</h3>
                      <p className="text-sm text-muted-foreground">Technologies displayed in the background animation</p>
                    </div>
                  </div>
                  <button
                    onClick={addTech}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tech
                  </button>
                </div>
              </div>

              <div className="p-5">
                {techStack.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No technologies added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {techStack.map((tech: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-background border border-border rounded-lg p-3 hover:border-emerald-500/50 transition-colors">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => updateTech(index, e.target.value)}
                          placeholder="Python"
                          className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        <button
                          onClick={() => deleteTech(index)}
                          className="flex items-center justify-center w-8 h-8 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-500 text-xs font-bold">ℹ</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Usage:</p>
                    <p>These technologies appear as floating particles in the background animation on the homepage.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">About Content</h2>
                <p className="text-sm text-muted-foreground">Intro, story paragraphs, and highlights</p>
              </div>
              <button
                onClick={() => { saveAboutContent(about); showSavedMessage(); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            {/* Introduction */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Introduction</h3>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Main intro paragraph (appears at the top)
                </label>
                <textarea
                  value={about.intro || ''}
                  onChange={(e) => setAbout({ ...about, intro: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground min-h-[100px]"
                  placeholder="I am a passionate Software Engineer specializing in..."
                />
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Story Paragraphs</h3>
                <button
                  onClick={() => {
                    const updated = [...(about.story || []), ''];
                    setAbout({ ...about, story: updated });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Paragraph
                </button>
              </div>

              <div className="space-y-3">
                {about.story?.map((para: string, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Paragraph {index + 1}
                        </label>
                        <textarea
                          value={para}
                          onChange={(e) => {
                            const updated = [...about.story];
                            updated[index] = e.target.value;
                            setAbout({ ...about, story: updated });
                          }}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground min-h-[80px]"
                          placeholder="My journey began with..."
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = about.story.filter((_: string, i: number) => i !== index);
                          setAbout({ ...about, story: updated });
                        }}
                        className="mt-6 flex items-center justify-center w-9 h-9 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!about.story || about.story.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No story paragraphs yet. Click "Add Paragraph" to start.
                  </p>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Highlights</h3>
                <button
                  onClick={() => {
                    const newHighlight = {
                      title: 'New Highlight',
                      description: 'Description here',
                      stat: '0'
                    };
                    const updated = [...(about.highlights || []), newHighlight];
                    setAbout({ ...about, highlights: updated });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Highlight
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {about.highlights?.map((highlight: any, index: number) => (
                  <div key={index} className="bg-background border border-border rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                        <input
                          type="text"
                          value={highlight.title}
                          onChange={(e) => {
                            const updated = [...about.highlights];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setAbout({ ...about, highlights: updated });
                          }}
                          className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-sm"
                          placeholder="Full-Stack Development"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                        <textarea
                          value={highlight.description}
                          onChange={(e) => {
                            const updated = [...about.highlights];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setAbout({ ...about, highlights: updated });
                          }}
                          className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-sm min-h-[60px]"
                          placeholder="Building responsive web apps..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Stat/Badge</label>
                        <input
                          type="text"
                          value={highlight.stat}
                          onChange={(e) => {
                            const updated = [...about.highlights];
                            updated[index] = { ...updated[index], stat: e.target.value };
                            setAbout({ ...about, highlights: updated });
                          }}
                          className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-sm"
                          placeholder="3+ Years"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = about.highlights.filter((_: any, i: number) => i !== index);
                          setAbout({ ...about, highlights: updated });
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 w-full justify-center text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Highlight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {(!about.highlights || about.highlights.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No highlights yet. Click "Add Highlight" to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
              <button
                onClick={() => { savePersonalInfo(personal); showSavedMessage(); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              {/* Profile Image Upload Section */}
              <div className="mb-6 p-6 bg-background border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {personal.profileImage ? (
                      <img
                        src={personal.profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-border">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload New Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (max 2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image size should be less than 2MB');
                            return;
                          }

                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageToCrop(reader.result as string);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                            setIsCropModalOpen(true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: Square image, max 2MB. Supports JPG, PNG, WebP
                    </p>
                    {personal.profileImage && (
                      <button
                        onClick={() => setPersonal({ ...personal, profileImage: '' })}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={personal.name || ''}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <input
                    type="text"
                    value={personal.firstName || ''}
                    onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={personal.title || ''}
                    onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tagline</label>
                  <input
                    type="text"
                    value={personal.tagline || ''}
                    onChange={(e) => setPersonal({ ...personal, tagline: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={personal.email || ''}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personal.phone || ''}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <input
                    type="text"
                    value={personal.location || ''}
                    onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Company</label>
                  <input
                    type="text"
                    value={personal.currentCompany || ''}
                    onChange={(e) => setPersonal({ ...personal, currentCompany: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="WorkBooster AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Badge Text (Hero)</label>
                  <input
                    type="text"
                    value={personal.badgeText || ''}
                    onChange={(e) => setPersonal({ ...personal, badgeText: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    placeholder="AI Automation Expert @"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Education</label>
                  <input
                    type="text"
                    value={personal.education || ''}
                    onChange={(e) => setPersonal({ ...personal, education: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={personal.linkedin || ''}
                    onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={personal.github || ''}
                    onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Current Company</label>
                  <input
                    type="text"
                    value={personal.currentCompany || ''}
                    onChange={(e) => setPersonal({ ...personal, currentCompany: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Appearance Settings</h2>
                <p className="text-sm text-muted-foreground">Customize colors, particles, and visual effects</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await resetThemeSettings();
                    const newSettings = await getThemeSettings();
                    setThemeSettings(newSettings);
                    showSavedMessage();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Defaults
                </button>
                <button
                  onClick={async () => {
                    if (themeSettings) {
                      await saveThemeSettings(themeSettings);
                      applyTheme(themeSettings);
                      showSavedMessage();
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

            {themeSettings ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Color Presets Section */}
                <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Theme Presets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {/* Emerald Theme */}
                    <button
                      onClick={() => setThemeSettings({
                        ...themeSettings,
                        colors: { primary: '#10b981', accent: '#8b5cf6', background: '#030712', backgroundAlt: '#0f172a', foreground: '#f8fafc', muted: '#94a3b8' }
                      })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${themeSettings.colors.primary === '#10b981'
                        ? 'border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-[#10b981]/10'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#10b981' }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Emerald</span>
                    </button>

                    {/* Ocean Blue */}
                    <button
                      onClick={() => setThemeSettings({
                        ...themeSettings,
                        colors: { primary: '#0ea5e9', accent: '#6366f1', background: '#020617', backgroundAlt: '#0f172a', foreground: '#f8fafc', muted: '#94a3b8' }
                      })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${themeSettings.colors.primary === '#0ea5e9'
                        ? 'border-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.4)] bg-[#0ea5e9]/10'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#6366f1' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Ocean</span>
                    </button>

                    {/* Sunset */}
                    <button
                      onClick={() => setThemeSettings({
                        ...themeSettings,
                        colors: { primary: '#f97316', accent: '#ec4899', background: '#0c0a09', backgroundAlt: '#1c1917', foreground: '#fafaf9', muted: '#a8a29e' }
                      })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${themeSettings.colors.primary === '#f97316'
                        ? 'border-[#f97316] shadow-[0_0_20px_rgba(249,115,22,0.4)] bg-[#f97316]/10'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#f97316' }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#ec4899' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Sunset</span>
                    </button>

                    {/* Forest */}
                    <button
                      onClick={() => setThemeSettings({
                        ...themeSettings,
                        colors: { primary: '#22c55e', accent: '#14b8a6', background: '#022c22', backgroundAlt: '#064e3b', foreground: '#ecfdf5', muted: '#6ee7b7' }
                      })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${themeSettings.colors.primary === '#22c55e'
                        ? 'border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)] bg-[#22c55e]/10'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#14b8a6' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Forest</span>
                    </button>

                    {/* Random */}
                    <button
                      onClick={() => {
                        const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                        setThemeSettings({
                          ...themeSettings,
                          colors: {
                            primary: randomHex(),
                            accent: randomHex(),
                            background: '#030712',
                            backgroundAlt: '#0f172a',
                            foreground: '#f8fafc',
                            muted: '#94a3b8'
                          }
                        });
                      }}
                      className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary transition-all text-center bg-gradient-to-br from-red-500/10 via-green-500/10 to-blue-500/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
                      </div>
                      <span className="text-xs text-muted-foreground">🎲 Random</span>
                    </button>

                    {/* Custom - Shows current colors */}
                    <button
                      onClick={() => {
                        // If currently on a preset, modify the color slightly to unlock custom mode
                        const presetColors = ['#10b981', '#0ea5e9', '#f97316', '#22c55e'];
                        if (presetColors.includes(themeSettings.colors.primary)) {
                          // Set to a custom color that unlocks the pickers
                          setThemeSettings({
                            ...themeSettings,
                            colors: {
                              ...themeSettings.colors,
                              primary: '#10b982', // Slightly different to unlock
                              accent: '#8b5cf7'  // Slightly different
                            }
                          });
                        }
                        // Scroll to custom colors section
                        setTimeout(() => {
                          document.getElementById('custom-colors-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${!['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary)
                        ? `border-current shadow-[0_0_20px_currentColor] bg-current/10`
                        : 'border-border hover:border-primary'
                        }`}
                      style={{
                        borderColor: !['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary) ? themeSettings.colors.primary : undefined,
                        boxShadow: !['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary) ? `0 0 20px ${themeSettings.colors.primary}40` : undefined,
                        backgroundColor: !['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary) ? `${themeSettings.colors.primary}15` : undefined
                      }}
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeSettings.colors.primary }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeSettings.colors.accent }} />
                      </div>
                      <span className="text-xs text-muted-foreground">🎨 Custom</span>
                    </button>

                    {/* Saved Custom Presets */}
                    {customPresets.map((preset) => (
                      <div key={preset.id} className="relative group">
                        <button
                          onClick={() => setThemeSettings({
                            ...themeSettings,
                            colors: {
                              primary: preset.primary,
                              accent: preset.accent,
                              background: preset.background,
                              backgroundAlt: preset.backgroundAlt,
                              foreground: preset.foreground,
                              muted: preset.muted
                            }
                          })}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-center ${themeSettings.colors.primary === preset.primary
                            ? `border-current shadow-[0_0_20px_currentColor]`
                            : 'border-border hover:border-primary'
                            }`}
                          style={{
                            borderColor: themeSettings.colors.primary === preset.primary ? preset.primary : undefined,
                            boxShadow: themeSettings.colors.primary === preset.primary ? `0 0 20px ${preset.primary}40` : undefined,
                            backgroundColor: themeSettings.colors.primary === preset.primary ? `${preset.primary}15` : undefined
                          }}
                        >
                          <div className="flex gap-1 justify-center mb-2">
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">{preset.name}</span>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Delete this preset?')) {
                              await deleteCustomPreset(preset.id);
                              setCustomPresets(await getCustomPresets());
                            }
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Save as Preset Button */}
                  {!['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary) && (
                    <div className="mt-4 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Enter preset name..."
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      />
                      <button
                        onClick={async () => {
                          if (presetName.trim()) {
                            await saveCustomPreset(presetName.trim(), themeSettings.colors);
                            setCustomPresets(await getCustomPresets());
                            setPresetName('');
                            showSavedMessage();
                          }
                        }}
                        disabled={!presetName.trim()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Save as Preset
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Colors Section */}
                {(() => {
                  const isPresetSelected = ['#10b981', '#0ea5e9', '#f97316', '#22c55e'].includes(themeSettings.colors.primary);
                  return (
                    <div id="custom-colors-section" className={`bg-card border border-border rounded-xl p-6 ${isPresetSelected ? 'opacity-50' : ''}`}>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        🎨 Custom Colors
                        {isPresetSelected && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full ml-2">
                            🔒 Click "Custom" preset to edit
                          </span>
                        )}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={themeSettings.colors.primary}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, primary: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`w-12 h-12 rounded-lg border-2 border-border ${isPresetSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <input
                              type="text"
                              value={themeSettings.colors.primary}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, primary: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-mono ${isPresetSelected ? 'cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Accent Color (Glow)</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={themeSettings.colors.accent}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, accent: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`w-12 h-12 rounded-lg border-2 border-border ${isPresetSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <input
                              type="text"
                              value={themeSettings.colors.accent}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, accent: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-mono ${isPresetSelected ? 'cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Background Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={themeSettings.colors.background}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, background: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`w-12 h-12 rounded-lg border-2 border-border ${isPresetSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <input
                              type="text"
                              value={themeSettings.colors.background}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, background: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-mono ${isPresetSelected ? 'cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Text Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={themeSettings.colors.foreground}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, foreground: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`w-12 h-12 rounded-lg border-2 border-border ${isPresetSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <input
                              type="text"
                              value={themeSettings.colors.foreground}
                              onChange={(e) => setThemeSettings({
                                ...themeSettings,
                                colors: { ...themeSettings.colors, foreground: e.target.value }
                              })}
                              disabled={isPresetSelected}
                              className={`flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-mono ${isPresetSelected ? 'cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Particles Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    ✨ Particle Effects
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Enable Particles</label>
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, enabled: !themeSettings.particles.enabled }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.particles.enabled ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.particles.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Particle Count: {themeSettings.particles.count}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={themeSettings.particles.count}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, count: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Tech Labels (Python, React, etc.)</label>
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, techLabels: !themeSettings.particles.techLabels }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.particles.techLabels ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.particles.techLabels ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Neural Network Lines</label>
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, neuralLines: !themeSettings.particles.neuralLines }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.particles.neuralLines ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.particles.neuralLines ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Glowing Orbs</label>
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, orbsEnabled: !themeSettings.particles.orbsEnabled }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.particles.orbsEnabled ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.particles.orbsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Orbs Opacity: {themeSettings.particles.orbsOpacity}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={themeSettings.particles.orbsOpacity}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          particles: { ...themeSettings.particles, orbsOpacity: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Effects Section */}
                <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    🎨 Additional Effects
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center gap-2 p-4 bg-background rounded-lg">
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          effects: { ...themeSettings.effects, customCursor: !themeSettings.effects.customCursor }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.effects.customCursor ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.effects.customCursor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-sm text-muted-foreground">Custom Cursor</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 p-4 bg-background rounded-lg">
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          effects: { ...themeSettings.effects, smoothScroll: !themeSettings.effects.smoothScroll }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.effects.smoothScroll ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.effects.smoothScroll ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-sm text-muted-foreground">Smooth Scroll</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 p-4 bg-background rounded-lg">
                      <button
                        onClick={() => setThemeSettings({
                          ...themeSettings,
                          effects: { ...themeSettings.effects, noiseOverlay: !themeSettings.effects.noiseOverlay }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${themeSettings.effects.noiseOverlay ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${themeSettings.effects.noiseOverlay ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-sm text-muted-foreground">Noise Overlay</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 p-4 bg-background rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Noise: {themeSettings.effects.noiseOpacity}%</div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={themeSettings.effects.noiseOpacity}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          effects: { ...themeSettings.effects, noiseOpacity: parseFloat(e.target.value) }
                        })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading theme settings...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Crop Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-2xl sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Adjust Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-80 bg-background/50 rounded-lg overflow-hidden border border-border mt-4">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={true}
              />
            )}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zoom</span>
              <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <DialogFooter className="mt-6 flex gap-2">
            <button
              onClick={() => setIsCropModalOpen(false)}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Apply & Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
