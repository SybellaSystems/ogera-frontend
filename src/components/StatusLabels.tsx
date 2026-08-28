  export type ReferralFilter =
  | "all"
  | "Draft"
  | "Pending"
  | "Verified"
  | "Active"
  | "Closed"
  | "Rejected"
  | "Expired";

  export const getStatusLabel = (jobStatus: ReferralFilter) => {
    switch (jobStatus) {
      case "Draft":
        return "Draft";

      case "Pending":
        return "Pending";

      case "Verified":
        return "Verified";

      case "Active":
        return "Active";

      case "Closed":
        return "Closed";

      case "Rejected":
        return "Rejected";

      case "Expired":
        return "Expired";

      default:
        return jobStatus;
    }
  };

  export const getStatusClasses = (jobStatus: ReferralFilter) => {
    switch (jobStatus) {
      case "Active":
        return "bg-green-100 text-green-700";

    case "Verified":
        return "bg-purple-200 text-purple-700";

    case "Pending":
        return "bg-yellow-100 text-yellow-600";

    case "Closed":
        return "bg-red-100 text-red-600";

    case "Rejected":
        return "bg-purple-200 text-purple-800";

    case "Expired":
        return "bg-purple-50 text-purple-500";

    default:
        return "bg-purple-50 text-purple-700";
    }
  };
