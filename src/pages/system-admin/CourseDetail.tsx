import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Users, Clock, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mockCourses, mockModules, mockContent, mockAssignments, mockQuizzes, mockCourseAnalytics, mockEnrollments } from '@/data/mockCourseData';
import { Course, CourseModule, CourseContent } from '@/types/course';
import { ContentItem } from '@/components/course/ContentItem';
import { AddModuleDialog } from '@/components/course/AddModuleDialog';
import { AddContentDialog } from '@/components/course/AddContentDialog';
import { EditContentDialog } from '@/components/course/EditContentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SystemAdminCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isEditContentOpen, setIsEditContentOpen] = useState(false);
  const [isDeleteModuleOpen, setIsDeleteModuleOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const courseData = mockCourses.find(c => c.id === courseId);
        const modulesData = mockModules.filter(m => m.course_id === courseId);
        const contentData = mockContent.filter(c => c.course_id === courseId);
        
        if (!courseData) {
          toast.error('Course not found');
          navigate('/system-admin/course-management');
          return;
        }

        setCourse(courseData);
        setModules(modulesData.sort((a, b) => a.order - b.order));
        setContent(contentData);
      } catch (error) {
        toast.error('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, navigate]);

  const getModuleContent = (moduleId: string) => {
    return content
      .filter(c => c.module_id === moduleId)
      .sort((a, b) => a.order - b.order);
  };

  const handleEditModule = (e: React.MouseEvent, module: CourseModule) => {
    e.stopPropagation();
    setSelectedModule(module);
    setIsEditModuleOpen(true);
  };

  const handleDeleteModule = (e: React.MouseEvent, module: CourseModule) => {
    e.stopPropagation();
    setSelectedModule(module);
    setIsDeleteModuleOpen(true);
  };

  const confirmDeleteModule = () => {
    if (selectedModule) {
      setModules(modules.filter(m => m.id !== selectedModule.id));
      setContent(content.filter(c => c.module_id !== selectedModule.id));
      toast.success('Module deleted successfully');
      setIsDeleteModuleOpen(false);
      setSelectedModule(null);
    }
  };

  const handleAddContent = (module: CourseModule) => {
    setSelectedModule(module);
    setIsAddContentOpen(true);
  };

  const handleEditContent = (contentItem: CourseContent) => {
    setSelectedContent(contentItem);
    setIsEditContentOpen(true);
  };

  const handleDeleteContent = (contentId: string) => {
    setContent(content.filter(c => c.id !== contentId));
    toast.success('Content deleted successfully');
  };

  const handleSaveModule = (moduleData: Partial<CourseModule>) => {
    if (selectedModule) {
      // Edit mode
      setModules(modules.map(m => m.id === selectedModule.id ? { ...m, ...moduleData } : m));
      toast.success('Module updated successfully');
    } else {
      // Add mode
      const newModule: CourseModule = {
        id: `mod-${Date.now()}`,
        course_id: courseId!,
        title: moduleData.title!,
        description: moduleData.description!,
        order: modules.length + 1,
        created_at: new Date().toISOString()
      };
      setModules([...modules, newModule]);
      toast.success('Module added successfully');
    }
    setIsAddModuleOpen(false);
    setIsEditModuleOpen(false);
    setSelectedModule(null);
  };

  const handleSaveContent = (contentData: Partial<CourseContent>) => {
    if (selectedContent) {
      // Edit mode
      setContent(content.map(c => c.id === selectedContent.id ? { ...c, ...contentData } : c));
      toast.success('Content updated successfully');
    } else {
      // Add mode
      const newContent: CourseContent = {
        id: `content-${Date.now()}`,
        course_id: courseId!,
        module_id: selectedModule!.id,
        title: contentData.title!,
        type: contentData.type!,
        file_url: contentData.file_url,
        youtube_url: contentData.youtube_url,
        external_url: contentData.external_url,
        duration_minutes: contentData.duration_minutes,
        file_size_mb: contentData.file_size_mb,
        order: getModuleContent(selectedModule!.id).length + 1,
        views_count: 0,
        created_at: new Date().toISOString()
      };
      setContent([...content, newContent]);
      toast.success('Content added successfully');
    }
    setIsAddContentOpen(false);
    setIsEditContentOpen(false);
    setSelectedContent(null);
  };

  const categoryColors: Record<string, string> = {
    ai_ml: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    web_dev: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    iot: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    robotics: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    data_science: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-600 dark:text-green-400',
    intermediate: 'text-yellow-600 dark:text-yellow-400',
    advanced: 'text-red-600 dark:text-red-400',
  };

  if (isLoading || !course) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-40 bg-muted rounded-lg" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </Layout>
    );
  }

  const courseAnalytics = mockCourseAnalytics.find(a => a.course_id === courseId);
  const courseEnrollments = mockEnrollments.filter(e => e.course_id === courseId);
  const courseAssignments = mockAssignments.filter(a => a.course_id === courseId);
  const courseQuizzes = mockQuizzes.filter(q => q.course_id === courseId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/system-admin/course-management')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={course.thumbnail_url || '/placeholder.svg'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={categoryColors[course.category]}>
                  {course.category.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground mb-3">{course.course_code}</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseAnalytics?.total_enrollments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.duration_weeks} weeks</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseAnalytics?.completion_rate.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{course.description}</p>
                
                <div>
                  <h3 className="font-semibold mb-2">Difficulty Level</h3>
                  <Badge variant="outline" className={difficultyColors[course.difficulty]}>
                    {course.difficulty.toUpperCase()}
                  </Badge>
                </div>

                {course.prerequisites && (
                  <div>
                    <h3 className="font-semibold mb-2">Prerequisites</h3>
                    <p className="text-muted-foreground">{course.prerequisites}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {course.learning_outcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Course Modules</h2>
                <p className="text-muted-foreground">Manage course content and structure</p>
              </div>
              <Button onClick={() => setIsAddModuleOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="text-muted-foreground mb-4">No modules yet</div>
                  <Button onClick={() => setIsAddModuleOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Module {module.order}</Badge>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditModule(e, module)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteModule(e, module)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <p className="text-muted-foreground mb-4">{module.description}</p>
                      
                      <div className="space-y-2">
                        {getModuleContent(module.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground italic py-4">
                            No content added yet. Click below to add learning materials.
                          </p>
                        ) : (
                          getModuleContent(module.id).map((contentItem) => (
                            <ContentItem
                              key={contentItem.id}
                              content={contentItem}
                              onEdit={handleEditContent}
                              onDelete={handleDeleteContent}
                            />
                          ))
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => handleAddContent(module)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Content to this Module
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>{courseAssignments.length} assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {courseAssignments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No assignments yet</p>
                ) : (
                  <div className="space-y-4">
                    {courseAssignments.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Points: {assignment.total_points}</span>
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Quizzes</CardTitle>
                <CardDescription>{courseQuizzes.length} quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                {courseQuizzes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No quizzes yet</p>
                ) : (
                  <div className="space-y-4">
                    {courseQuizzes.map((quiz) => (
                      <Card key={quiz.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <CardDescription>{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Time: {quiz.time_limit_minutes} min</span>
                            <span>Attempts: {quiz.attempts_allowed}</span>
                            <span>Pass: {quiz.pass_percentage}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseAnalytics && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Students</p>
                      <p className="text-2xl font-bold">{courseAnalytics.active_students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Students</p>
                      <p className="text-2xl font-bold">{courseAnalytics.completed_students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Assignment Score</p>
                      <p className="text-2xl font-bold">{courseAnalytics.average_assignment_score.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                      <p className="text-2xl font-bold">{courseAnalytics.average_quiz_score.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddModuleDialog
          open={isAddModuleOpen}
          onOpenChange={setIsAddModuleOpen}
          onSave={handleSaveModule}
        />

        <AddModuleDialog
          open={isEditModuleOpen}
          onOpenChange={setIsEditModuleOpen}
          onSave={handleSaveModule}
          module={selectedModule}
        />

        <AddContentDialog
          open={isAddContentOpen}
          onOpenChange={setIsAddContentOpen}
          onSave={handleSaveContent}
          moduleName={selectedModule?.title || ''}
        />

        <EditContentDialog
          open={isEditContentOpen}
          onOpenChange={setIsEditContentOpen}
          onSave={handleSaveContent}
          content={selectedContent}
        />

        <AlertDialog open={isDeleteModuleOpen} onOpenChange={setIsDeleteModuleOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Module?</AlertDialogTitle>
              <AlertDialogDescription>
                This module contains {selectedModule ? getModuleContent(selectedModule.id).length : 0} content items. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteModule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Module
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
