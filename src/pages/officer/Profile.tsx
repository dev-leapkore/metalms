import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { getOfficerByEmail } from '@/data/mockOfficerData';
import { mockAttendanceData } from '@/data/mockAttendanceData';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Code,
  Building2,
  Briefcase,
  CreditCard,
  Shield,
  Calendar,
  Clock,
  ChevronDown,
  CalendarDays,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Get officer data
  const officer = user?.email ? getOfficerByEmail(user.email) : null;
  
  // Get attendance data
  const attendanceRecords = officer 
    ? mockAttendanceData.filter(a => a.officer_id === officer.id)
    : [];

  // Get current month attendance
  const currentDate = new Date();
  const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthAttendance = attendanceRecords.find(a => a.month === currentMonthYear);
  
  // Calculate attendance percentage
  const calculateAttendancePercentage = (record: typeof attendanceRecords[0]) => {
    const totalDays = record.present_days + record.absent_days + record.leave_days;
    if (totalDays === 0) return 0;
    return Math.round((record.present_days / totalDays) * 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewAttendance = (month: string) => {
    setSelectedMonth(month);
    setShowAttendanceCalendar(true);
  };

  if (!officer) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Officer profile not found</p>
        </div>
      </Layout>
    );
  }

  const attendanceForDialog = attendanceRecords.find(a => a.month === selectedMonth);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View your personal and professional information</p>
        </div>

        {/* Profile Header Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={officer.profile_photo_url} alt={officer.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(officer.name)}
                </AvatarFallback>
              </Avatar>

              {/* Main Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{officer.name}</h2>
                  <p className="text-muted-foreground">{officer.employee_id}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant={officer.status === 'active' ? 'default' : 'secondary'}>
                    {officer.status === 'active' ? 'Active' : 'On Leave'}
                  </Badge>
                  <Badge variant="outline">{officer.employment_type.replace('_', ' ').toUpperCase()}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    {officer.department}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">{new Date(officer.join_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{officer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{officer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{new Date(officer.date_of_birth).toLocaleDateString()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </p>
                <p className="font-medium">{officer.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Qualifications</p>
                <ul className="space-y-1">
                  {officer.qualifications.map((qual, idx) => (
                    <li key={idx} className="text-sm font-medium">• {qual}</li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {officer.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{officer.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{officer.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <p className="font-medium capitalize">{officer.employment_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={officer.status === 'active' ? 'default' : 'secondary'}>
                    {officer.status}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {officer.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
              <CardDescription>Current month attendance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMonthAttendance ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {currentMonthAttendance.present_days}
                      </p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {currentMonthAttendance.absent_days}
                      </p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {currentMonthAttendance.leave_days}
                      </p>
                      <p className="text-xs text-muted-foreground">Leave</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {calculateAttendancePercentage(currentMonthAttendance)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Hours:</span>
                    <span className="font-medium">{currentMonthAttendance.total_hours_worked} hrs</span>
                  </div>

                  <Button 
                    onClick={() => handleViewAttendance(currentMonthYear)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Detailed Calendar
                  </Button>

                  {/* Last 3 Months Mini Summary */}
                  {attendanceRecords.length > 1 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-3">Recent Months</p>
                        <div className="space-y-2">
                          {attendanceRecords.slice(0, 3).map((record) => (
                            <div 
                              key={record.month}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted cursor-pointer"
                              onClick={() => handleViewAttendance(record.month)}
                            >
                              <span className="text-sm font-medium">
                                {new Date(record.month + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                              </span>
                              <Badge variant="outline">{calculateAttendancePercentage(record)}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attendance data available for current month
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Width Cards */}
        <div className="space-y-6">
          {/* Assigned Institutions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Assigned Institutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {officer.assigned_institutions.map((inst, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm capitalize">
                    {inst}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bank Details - Collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Details
                  </CardTitle>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Bank details are managed by the management team. Contact HR for updates.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Statutory Information - Collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statutory Information
                  </CardTitle>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Statutory information (PF, ESI, PAN, etc.) is managed by the management team. Contact HR for details.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>

      {/* Attendance Calendar Dialog */}
      {attendanceForDialog && (
        <AttendanceCalendar
          attendance={attendanceForDialog}
          isOpen={showAttendanceCalendar}
          onClose={() => setShowAttendanceCalendar(false)}
        />
      )}
    </Layout>
  );
}
