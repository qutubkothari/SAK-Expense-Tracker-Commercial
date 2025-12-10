// ================================================================
// PROJECT MANAGER - Business Expense Tracking with Projects
// ================================================================

class ProjectManager {
  constructor() {
    this.currentProject = null;
    this.projects = [];
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Project Manager...');
      await this.loadProjects();
      await this.ensureDefaultProject();
      console.log('✅ Project Manager initialized');
    } catch (error) {
      console.error('❌ Project Manager initialization failed:', error);
    }
  }

  async loadProjects() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user || !user.user || !user.user.id) {
        console.warn('⚠️ No user found for loading projects');
        return;
      }

      const userId = user.user.id;
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/projects?user_id=eq.${userId}&order=created_at.desc`,
        {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      this.projects = await response.json();
      
      // Set default project as current if exists
      const defaultProject = this.projects.find(p => p.is_default);
      if (defaultProject) {
        this.currentProject = defaultProject;
      } else if (this.projects.length > 0) {
        this.currentProject = this.projects[0];
      }

      console.log(`📁 Loaded ${this.projects.length} projects`);
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projects = [];
    }
  }

  async ensureDefaultProject() {
    try {
      // Check if default project exists
      const defaultProject = this.projects.find(p => p.is_default);
      if (defaultProject) {
        return defaultProject;
      }

      // Create default project
      const { data: user } = await supabase.auth.getUser();
      if (!user || !user.user || !user.user.id) {
        return null;
      }

      const newProject = {
        user_id: user.user.id,
        name: 'General Business Expenses',
        description: 'Default project for general business expenses',
        is_default: true,
        status: 'active',
        currency: localStorage.getItem('userCurrency') || 'INR'
      };

      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/projects`,
        {
          method: 'POST',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newProject)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create default project: ${response.statusText}`);
      }

      const [createdProject] = await response.json();
      this.projects.unshift(createdProject);
      this.currentProject = createdProject;
      
      console.log('✅ Created default project');
      return createdProject;
    } catch (error) {
      console.error('Error ensuring default project:', error);
      return null;
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }

  getProjects() {
    return this.projects;
  }
}

// Global instance
const projectManager = new ProjectManager();
