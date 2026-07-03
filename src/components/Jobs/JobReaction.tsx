import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

import {
  useLikeJobMutation,
  useDislikeJobMutation,
} from "../../services/api/jobsApi";

interface Props {
  job: any;
}

export default function JobReaction({ job }: Props) {
  const [likeJob] = useLikeJobMutation();

  const [dislikeJob] = useDislikeJobMutation();

  // const like = async () => {
  //     await likeJob(job.job_id);
  // };

  const like = async () => {
    try {
      await likeJob(job.job_id).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  // const dislike = async () => {
  //     await dislikeJob(job.job_id);
  // };

  const dislike = async () => {
    try {
      await dislikeJob(job.job_id).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <button
        onClick={like}
        className={`flex items-center gap-2 ${
          job.user_reaction === "like" ? "text-green-600" : "text-gray-500"
        }`}
      >
        <HandThumbUpIcon className="w-5 h-5" />

        {job.likes_count}
      </button>

      <button
        onClick={dislike}
        className={`flex items-center gap-2 ${
          job.user_reaction === "dislike" ? "text-red-600" : "text-gray-500"
        }`}
      >
        <HandThumbDownIcon className="w-5 h-5" />

        {job.dislikes_count}
      </button>
    </div>
  );
}
