import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '@/lib/adminAuth';
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
  initializeData
} from '@/lib/portfolioData';
import { Briefcase, FolderGit2, Code2, User, Settings, LogOut, Plus, Trash2, Save, Star, Award, Trophy, Link2, Mail } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'experiences' | 'projects' | 'skills' | 'about' | 'personal' | 'certifications' | 'contact' | 'navigation'>('experiences');
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

  useEffect(() => {
    document.body.classList.add('admin-panel');
    
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    initializeData();
    loadData();
    
    return () => document.body.classList.remove('admin-panel');
  }, [navigate]);

  const loadData = () => {
    setExperiences(getExperiences());
    setProjects(getProjects());
    setSkills(getSkills());
    setAbout(getAboutContent());
    setPersonal(getPersonalInfo());
    setCertifications(getCertifications());
    setAchievements(getAchievements());
    setContactInfo(getContactInfo());
    setSocials(getSocials());
    setChapters(getChapters());
    setTechStack(getTechStack());
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Force a small delay to ensure localStorage writes complete
    setTimeout(() => {
      // Set update timestamp to trigger storage event
      localStorage.setItem('portfolio_last_update', Date.now().toString());
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
      
      // Reload data in admin panel
      loadData();
    }, 50);
  };

  // Experience Management
  const addExperience = () => {
    const maxId = experiences.length > 0 ? Math.max(...experiences.map((e: any) => e.id || 0)) : 0;
    const newExp = {
      id: maxId + 1,
      title: 'New Role',
      company: 'Company Name',
      period: `${new Date().getFullYear()} - Present`,
      type: 'current',
      description: 'Role description',
      highlights: ['Achievement 1', 'Achievement 2', 'Achievement 3'],
      color: 'primary'
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const deleteExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const saveExperiencesData = () => {
    saveExperiences(experiences);
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

  const saveProjectsData = () => {
    saveProjects(projects);
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

  const saveSkillsData = () => {
    saveSkills(skills);
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

  const saveCertificationsData = () => {
    saveCertifications(certifications);
    saveAchievements(achievements);
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
    setSocials([...socials, { label: '', href: '' }]);
  };

  const updateSocial = (index: number, field: string, value: any) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const deleteSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const saveContactData = () => {
    saveContactInfo(contactInfo);
    saveSocials(socials);
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

  const saveChaptersData = () => {
    saveChapters(chapters);
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

  const saveTechStackData = () => {
    saveTechStack(techStack);
    showSavedMessage();
  };

  // Delete all data
  const deleteAllData = () => {
    if (confirm('Are you sure you want to delete ALL portfolio data? This cannot be undone!')) {
      localStorage.clear();
      alert('All data deleted. Page will reload.');
      window.location.reload();
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
              onClick={deleteAllData}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </button>
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
            { id: 'personal', label: 'Personal Info', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
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
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        exp.color === 'accent' ? 'bg-accent/20' : 'bg-primary/20'
                      }`}>
                        <Briefcase className={`w-5 h-5 ${
                          exp.color === 'accent' ? 'text-accent' : 'text-primary'
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exp.period?.includes('Present') 
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
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        project.color === 'accent' ? 'bg-accent/20' : 'bg-primary/20'
                      }`}>
                        <FolderGit2 className={`w-5 h-5 ${
                          project.color === 'accent' ? 'text-accent' : 'text-primary'
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
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Platform</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">URL</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
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
                            setPersonal({ ...personal, profileImage: reader.result as string });
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
      </div>
    </div>
  );
};

export default AdminDashboard;
