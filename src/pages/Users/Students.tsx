import React, { useState, useEffect } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { 
  Chip, 
  Avatar, 
  Box, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Grid,
  useMediaQuery,
  useTheme as useMuiTheme,
  IconButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import {
 // useGetAllStudentsQuery,
 useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";
import toast from "react-hot-toast";
import SuspendUserModal from "../../components/SuspendUserModal";
import EscalateUserModal from "../../components/EscalateUserModal";
import { useTheme } from "../../context/ThemeContext";

interface Student {
  index: number;
  id: number;
  userId: string; // Store the actual user_id (UUID) for API calls
  name: string;
  email: string;
  university: string;
  gpa: string;
  status: "Active" | "Pending";
  verified: boolean;
}

const Students: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [suspendStudent, setSuspendStudent] = useState<Student | null>(null);
  const [escalateStudent, setEscalateStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByIdMutation();

  const { data, isLoading, isError } = useGetAllUsersQuery({
    page: page + 1,
    limit: limit,
    type: "Student",
  });


  // Fetch full student details when viewing/editing
  const { data: studentDetails, isLoading: isLoadingStudentDetails } = useGetUserByIdQuery(
    studentToView?.userId || studentToEdit?.userId || "",
    { skip: !studentToView && !studentToEdit }
  );

  // Update form data when student details are loaded
  useEffect(() => {
    if (studentDetails?.data && studentToEdit) {
      setEditFormData({
        full_name: studentDetails.data.full_name,
        email: studentDetails.data.email,
        mobile_number: studentDetails.data.mobile_number,
        national_id_number: studentDetails.data.national_id_number,
        preferred_location: studentDetails.data.preferred_location,
      });
    }
  }, [studentDetails, studentToEdit]);

  // Map API user profile to Student row
  const mapStudent = (user: UserProfile, index: number): Student => ({
    index: page * limit + index + 1,
    id: Number(user.user_id),
    userId: user.user_id, // Store the UUID string for API calls
    name: user.full_name,
    email: user.email,
    university: "-", // adjust when backend adds field
    gpa: "-",
    status: "Active",
    verified: true,
  });

  const students: Student[] = (data?.data || []).map((user, index) =>
    mapStudent(user, index)
  );
  const totalCount = data?.pagination?.total || students.length;

  const columns: Column<Student>[] = [
    {
      id: "index",
      label: "#",
      minWidth: 60,
      align: "center",
      sortable: false,
      format: (value) => (
        <Typography sx={{ fontWeight: 500, color: "#6b7280" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "name",
      label: "Student",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#3b82f6",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "#111827" }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 200,
    },
    {
      id: "university",
      label: "University",
      minWidth: 150,
    },
    {
      id: "gpa",
      label: "GPA",
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "verified",
      label: "Verified",
      minWidth: 120,
      format: (value) =>
        value ? (
          <Chip
            label="✓ Verified"
            size="small"
            sx={{
              bgcolor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
            }}
          />
        ) : (
          <Chip
            label="Pending"
            size="small"
            sx={{
              bgcolor: "#fed7aa",
              color: "#9a3412",
              fontWeight: 600,
            }}
          />
        ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Active" ? "#d1fae5" : "#fed7aa",
            color: value === "Active" ? "#065f46" : "#9a3412",
            fontWeight: 600,
          }}
        />
      ),
    },
  ];

  const handleViewClick = (row: Student) => {
    setStudentToView(row);
    setViewDialogOpen(true);
  };

  const handleEditClick = (row: Student) => {
    setStudentToEdit(row);
    setEditDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setStudentToView(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setStudentToEdit(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!studentToEdit) return;

    try {
      await updateUser({ id: studentToEdit.userId, data: editFormData }).unwrap();
      toast.success("Student updated successfully");
      handleCloseEditDialog();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update student");
    }
  };

  const actions: TableAction<Student>[] = [
    {
      label: "View Profile",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        handleViewClick(row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        handleEditClick(row);
      },
      color: "primary",
    },
    {
      label: "Suspend",
      icon: <LockIcon fontSize="small" />,
      onClick: (row) => {
        setSuspendStudent(row);
        setSuspendModalOpen(true);
      },
      color: "warning",
    },
    {
      label: "Escalate",
      icon: <FlagIcon fontSize="small" />,
      onClick: (row) => {
        setEscalateStudent(row);
        setEscalateModalOpen(true);
      },
      color: "error",
    },
  ];

  return (
    <div
      className="space-y-6 animate-fadeIn"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 md:gap-3"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            <AcademicCapIcon
              className="h-8 w-8 md:h-10 md:w-10"
              style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
            />
            Students
          </h1>
          <p
            className="text-sm md:text-base mt-2"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Manage all student accounts and their academic information
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          style={{
            backgroundColor: isDark ? "rgba(59,130,246,0.1)" : undefined,
            border: `1px solid ${isDark ? "rgba(59,130,246,0.25)" : "#bfdbfe"}`,
            borderRadius: "12px",
            padding: "24px",
          }}
          className={!isDark ? "bg-gradient-to-br from-blue-50 to-blue-100 shadow-md" : ""}
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#60a5fa" : "#1d4ed8", margin: 0 }}>Total Students</p>
          <p style={{ fontSize: "30px", fontWeight: 800, color: isDark ? "#93bbfd" : "#1e3a5f", margin: "8px 0 0" }}>
            {isLoading ? "…" : totalCount}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(22,163,74,0.1)" : undefined,
            border: `1px solid ${isDark ? "rgba(22,163,74,0.25)" : "#bbf7d0"}`,
            borderRadius: "12px",
            padding: "24px",
          }}
          className={!isDark ? "bg-gradient-to-br from-green-50 to-green-100 shadow-md" : ""}
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#4ade80" : "#166534", margin: 0 }}>
            On This Page
          </p>
          <p style={{ fontSize: "30px", fontWeight: 800, color: isDark ? "#86efac" : "#14532d", margin: "8px 0 0" }}>
            {isLoading ? "…" : students.length}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(234,88,12,0.1)" : undefined,
            border: `1px solid ${isDark ? "rgba(234,88,12,0.25)" : "#fed7aa"}`,
            borderRadius: "12px",
            padding: "24px",
          }}
          className={!isDark ? "bg-gradient-to-br from-orange-50 to-orange-100 shadow-md" : ""}
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#fb923c" : "#9a3412", margin: 0 }}>
            Total Pages
          </p>
          <p style={{ fontSize: "30px", fontWeight: 800, color: isDark ? "#fdba74" : "#7c2d12", margin: "8px 0 0" }}>
            {isLoading ? "…" : data?.pagination?.totalPages || 1}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <CustomTable
        columns={columns}
        data={students}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError
            ? "Failed to load students. Please try again."
            : totalCount === 0
            ? "No students present"
            : "No students found"
        }
        searchable={true}
        searchPlaceholder="Search students..."
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={limit}
        serverSidePagination={true}
        totalCount={totalCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(0);
        }}
      />

      {/* View Student Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: {
            m: isMobile ? 0 : "48px auto",
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "100%" : "500px",
            maxHeight: isMobile ? "100vh" : "calc(100vh - 96px)",
            height: isMobile ? "100vh" : "auto",
            borderRadius: isMobile ? 0 : 1,
            display: "flex",
            flexDirection: "column",
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: isMobile ? "flex-end" : "center",
            padding: isMobile ? 0 : "24px",
          },
          "& .MuiDialogContent-root": {
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: isSmallMobile ? "12px" : isMobile ? "16px" : "20px",
            flex: "1 1 auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            gap: 1,
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
            py: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.25rem",
            position: isMobile ? "sticky" : "relative",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 2,
            borderBottom: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <ViewIcon 
              color="primary" 
              fontSize={isSmallMobile ? "small" : isMobile ? "medium" : "medium"}
              sx={{ fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "24px" }}
            />
            <Typography 
              variant={isSmallMobile ? "body1" : isMobile ? "subtitle1" : "h6"} 
              component="span"
              sx={{ 
                fontWeight: 600,
                fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.25rem",
              }}
            >
              Student Details
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseViewDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "text.primary",
              },
              width: isSmallMobile ? 28 : isMobile ? 32 : 36,
              height: isSmallMobile ? 28 : isMobile ? 32 : 36,
              position: "absolute",
              right: isSmallMobile ? 8 : isMobile ? 12 : 16,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <CloseIcon 
              fontSize={isSmallMobile ? "small" : isMobile ? "medium" : "medium"}
              sx={{ fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "24px" }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 2.5, 
            pb: isSmallMobile ? 1 : isMobile ? 1.25 : 1.5,
            pt: isSmallMobile ? 1.25 : isMobile ? 1.5 : 2,
          }}
        >
          {isLoadingStudentDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: isMobile ? 2 : 4 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          ) : studentDetails?.data ? (
            <Box>
              {/* Student Profile Header Card */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
                  mb: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
                  p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  flexDirection: isMobile ? "column" : "row",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "#3b82f6",
                    width: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    height: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    fontSize: isSmallMobile ? "1.25rem" : isMobile ? "1.5rem" : "1.75rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {studentDetails.data.full_name?.charAt(0) || "S"}
                </Avatar>
                <Box sx={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  <Typography 
                    variant={isSmallMobile ? "subtitle2" : isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: isSmallMobile ? "0.9375rem" : isMobile ? "1.125rem" : "1.25rem",
                      mb: 0.5,
                      color: "text.primary",
                    }}
                  >
                    {studentDetails.data.full_name}
                  </Typography>
                  <Chip
                    label="Student"
                    size="small"
                    sx={{
                      bgcolor: "#dbeafe",
                      color: "#1e40af",
                      fontWeight: 600,
                      fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                      height: isSmallMobile ? "20px" : isMobile ? "22px" : "24px",
                      px: 0.75,
                    }}
                  />
                </Box>
              </Box>

              {/* Details Section */}
              <Grid container spacing={isSmallMobile ? 1.5 : isMobile ? 2 : 2}>
                {/* Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email Address
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        wordBreak: "break-word",
                        color: "text.primary",
                      }}
                    >
                      {studentDetails.data.email}
                    </Typography>
                  </Box>
                </Grid>

                {/* Mobile Number */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Mobile Number
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {studentDetails.data.mobile_number || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* National ID Number */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(59, 130, 246, 0.05)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      National ID Number
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        wordBreak: "break-word",
                        color: "text.primary",
                      }}
                    >
                      {studentDetails.data.national_id_number || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* Preferred Location */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Preferred Location
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {studentDetails.data.preferred_location || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* Email Verification */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: studentDetails.data.email_verified 
                        ? "rgba(16, 185, 129, 0.08)" 
                        : "rgba(153, 27, 27, 0.08)",
                      border: `1px solid ${studentDetails.data.email_verified 
                        ? "rgba(16, 185, 129, 0.2)" 
                        : "rgba(153, 27, 27, 0.2)"}`,
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email Verification
                    </Typography>
                    <Chip
                      icon={studentDetails.data.email_verified ? (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#065f46",
                          }}
                        />
                      ) : undefined}
                      label={studentDetails.data.email_verified ? "Verified" : "Not Verified"}
                      size="small"
                      sx={{
                        bgcolor: studentDetails.data.email_verified ? "#d1fae5" : "#fee2e2",
                        color: studentDetails.data.email_verified ? "#065f46" : "#991b1b",
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        height: isSmallMobile ? "22px" : isMobile ? "24px" : "26px",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Phone Verification */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: studentDetails.data.phone_verified 
                        ? "rgba(16, 185, 129, 0.08)" 
                        : "rgba(153, 27, 27, 0.08)",
                      border: `1px solid ${studentDetails.data.phone_verified
                        ? "rgba(16, 185, 129, 0.2)" 
                        : "rgba(153, 27, 27, 0.2)"}`,
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Phone Verification
                    </Typography>
                    <Chip
                      icon={studentDetails.data.phone_verified ? (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#065f46",
                          }}
                        />
                      ) : undefined}
                      label={studentDetails.data.phone_verified ? "Verified" : "Not Verified"}
                      size="small"
                      sx={{
                        bgcolor: studentDetails.data.phone_verified ? "#d1fae5" : "#fee2e2",
                        color: studentDetails.data.phone_verified ? "#065f46" : "#991b1b",
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        height: isSmallMobile ? "22px" : isMobile ? "24px" : "26px",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Account Created */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Account Created
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {studentDetails.data.created_at
                        ? new Date(studentDetails.data.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: isSmallMobile ? "0.625rem" : isMobile ? "0.65rem" : "0.7rem",
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {studentDetails.data.created_at
                        ? new Date(studentDetails.data.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>Student details not found</Typography>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 2.5, 
            pb: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
            pt: isSmallMobile ? 1 : isMobile ? 1.25 : 1.5,
            flexDirection: isMobile ? "column" : "row",
            gap: isSmallMobile ? 0.75 : isMobile ? 1 : 0,
            borderTop: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
            boxShadow: isMobile ? "0 -2px 8px rgba(0, 0, 0, 0.1)" : "none",
            flexShrink: 0,
          }}
        >
          <Button 
            onClick={handleCloseViewDialog} 
            variant="outlined" 
            color="inherit"
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 500 : 400,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "100%" : "600px",
            maxHeight: isMobile ? "100vh" : "90vh",
            height: isMobile ? "100vh" : "auto",
            borderRadius: isMobile ? 0 : 1,
            margin: isMobile ? 0 : "32px",
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: isMobile ? "flex-end" : "center",
          },
          "& .MuiDialogContent-root": {
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: isSmallMobile ? "16px" : isMobile ? "20px" : "24px",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            gap: 1,
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
            py: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.25rem",
            position: isMobile ? "sticky" : "relative",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 2,
            borderBottom: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <EditIcon 
              color="primary" 
              fontSize={isSmallMobile ? "small" : isMobile ? "medium" : "medium"}
              sx={{ fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "24px" }}
            />
            <Typography 
              variant={isSmallMobile ? "body1" : isMobile ? "subtitle1" : "h6"} 
              component="span"
              sx={{ 
                fontWeight: 600,
                fontSize: isSmallMobile ? "0.875rem" : isMobile ? "1rem" : "1.25rem",
              }}
            >
              Edit Student
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseEditDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "text.primary",
              },
              width: isSmallMobile ? 28 : isMobile ? 32 : 36,
              height: isSmallMobile ? 28 : isMobile ? 32 : 36,
              position: "absolute",
              right: isSmallMobile ? 8 : isMobile ? 12 : 16,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <CloseIcon 
              fontSize={isSmallMobile ? "small" : isMobile ? "medium" : "medium"}
              sx={{ fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "24px" }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 3, 
            pb: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            pt: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
            overflowY: "auto",
            maxHeight: isMobile ? "calc(100vh - 240px)" : "none",
            "&::-webkit-scrollbar": {
              width: isMobile ? "4px" : "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          }}
        >
          {isLoadingStudentDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: isMobile ? 2 : 4 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          ) : studentDetails?.data ? (
            <Box>
              {/* Student Info Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
                  mb: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
                  p: isSmallMobile ? 1.5 : isMobile ? 2 : 2.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "#3b82f6",
                    width: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    height: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    fontSize: isSmallMobile ? "1rem" : isMobile ? "1.25rem" : "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {studentDetails.data.full_name?.charAt(0) || "S"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={isSmallMobile ? "body2" : isMobile ? "body1" : "subtitle1"}
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "1rem",
                    }}
                  >
                    {studentDetails.data.full_name}
                  </Typography>
                  <Chip
                    label="Student"
                    size="small"
                    sx={{
                      bgcolor: "#dbeafe",
                      color: "#1e40af",
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                      height: isSmallMobile ? "20px" : isMobile ? "22px" : "24px",
                    }}
                  />
                </Box>
              </Box>

              <Grid container spacing={isSmallMobile ? 2 : isMobile ? 2.5 : 3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editFormData.full_name || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, full_name: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={editFormData.mobile_number || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mobile_number: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="National ID Number"
                    value={editFormData.national_id_number || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, national_id_number: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Preferred Location"
                    value={editFormData.preferred_location || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, preferred_location: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>Student details not found</Typography>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 3, 
            pb: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
            pt: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: isSmallMobile ? 0.75 : isMobile ? 1 : 0,
            borderTop: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
            boxShadow: isMobile ? "0 -2px 8px rgba(0, 0, 0, 0.1)" : "none",
          }}
        >
          <Button 
            onClick={handleCloseEditDialog} 
            variant="outlined" 
            color="inherit"
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 500 : 400,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={isUpdating || isLoadingStudentDetails}
            startIcon={isUpdating ? <CircularProgress size={isSmallMobile ? 16 : isMobile ? 18 : 20} /> : <EditIcon />}
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 600 : 500,
            }}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Student Modal */}
      <SuspendUserModal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSuspendStudent(null);
        }}
        user={
          suspendStudent
            ? { userId: suspendStudent.userId, name: suspendStudent.name, email: suspendStudent.email }
            : null
        }
        onSuccess={() => {
          setSuspendModalOpen(false);
          setSuspendStudent(null);
        }}
      />

      {/* Escalate Student Modal */}
      <EscalateUserModal
        isOpen={escalateModalOpen}
        onClose={() => {
          setEscalateModalOpen(false);
          setEscalateStudent(null);
        }}
        user={
          escalateStudent
            ? { userId: escalateStudent.userId, name: escalateStudent.name, email: escalateStudent.email, role: "Student" }
            : null
        }
        onSuccess={() => {
          setEscalateModalOpen(false);
          setEscalateStudent(null);
        }}
      />
    </div>
  );
};

export default Students;
