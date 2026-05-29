import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { username } = useParams();

	const { follow, isPending } = useFollow();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const {
		data: user,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userProfile"],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/users/profile/${username}`);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { data: followData } = useQuery({
	queryKey: ["followData", user?._id],
	queryFn: async () => {
		try {
			const res = await fetch(`/api/users/follow-data/${user?._id}`);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}

			return data;
		} catch (error) {
			throw new Error(error.message);
		}
	},
	enabled: !!user?._id,
});

	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	const isMyProfile = authUser._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt);
	const amIFollowing = authUser?.following.includes(user?._id);

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<>
			<div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
				{/* HEADER */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && !isRefetching && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative group/cover'>
								<img
									src={coverImg || user?.coverImg || "/cover.png"}
									className={`h-52 w-full object-cover ${
										isMyProfile ? "cursor-pointer" : ""
									}`}
									alt='cover image'
									onClick={() => {
										if (isMyProfile) {
											coverImgRef.current.click();
										}
									}}
								/>

								<input
									type='file'
									hidden
									accept='image/*'
									ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "coverImg")}
								/>
								<input
									type='file'
									hidden
									accept='image/*'
									ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImg")}
								/>
								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img 
											src={
												profileImg ||
												user?.profileImg ||
												"/avatar-placeholder.png"
											}
											className={isMyProfile ? "cursor-pointer" : ""}
											onClick={() => {
												if (isMyProfile) {
													profileImgRef.current.click();
												}
											}}
										/>
									</div>
								</div>
							</div>
							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && <EditProfileModal authUser={authUser} />}
								{!isMyProfile && (
									<button
										className='btn btn-outline rounded-full btn-sm'
										onClick={() => follow(user?._id)}
									>
										{isPending && "Loading..."}
										{!isPending && amIFollowing && "Unfollow"}
										{!isPending && !amIFollowing && "Follow"}
									</button>
								)}
								{(coverImg || profileImg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={async () => {
											await updateProfile({ coverImg, profileImg });
											setProfileImg(null);
											setCoverImg(null);
										}}
									>
										{isUpdatingProfile ? "Updating..." : "Update"}
									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user?.fullName}</span>
									<span className='text-sm text-slate-500'>@{user?.username}</span>
									<span className='text-sm my-1'>{user?.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user?.link && (
										<div className='flex gap-1 items-center '>
											<>
												<FaLink className='w-3 h-3 text-slate-500' />
												<a
													href='https://youtube.com/@asaprogrammer_'
													target='_blank'
													rel='noreferrer'
													className='text-sm text-blue-500 hover:underline'
												>
													{/* Updated this after recording the video. I forgot to update this while recording, sorry, thx. */}
													{user?.link}
												</a>
											</>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>{memberSinceDate}</span>
									</div>
								</div>
								<div className='flex gap-2'>
									<div
	className='flex gap-1 items-center cursor-pointer'
	onClick={() =>
		document.getElementById("following_modal").showModal()
	}
>
	<span className='font-bold text-xs'>
		{user?.following.length}
	</span>

	<span className='text-slate-500 text-xs'>
		Following
	</span>
</div>

<div
	className='flex gap-1 items-center cursor-pointer'
	onClick={() =>
		document.getElementById("followers_modal").showModal()
	}
>
	<span className='font-bold text-xs'>
		{user?.followers.length}
	</span>

	<span className='text-slate-500 text-xs'>
		Followers
	</span>
</div>
								</div>
							</div>
					{/* FOLLOWING MODAL */}
<dialog id='following_modal' className='modal'>
	<div className='modal-box border border-gray-700'>
		<h3 className='font-bold text-lg mb-4'>
			Following
		</h3>

		<div className='flex flex-col gap-4 max-h-96 overflow-auto'>
			{followData?.following?.length === 0 && (
				<p className='text-sm text-slate-500'>
					Not following anyone yet
				</p>
			)}

			{followData?.following?.map((person) => (
				<Link
					to={`/profile/${person.username}`}
					key={person._id}
					className='flex items-center gap-3 hover:bg-secondary p-2 rounded-lg'
				>
					<img
						src={
							person.profileImg ||
							"/avatar-placeholder.png"
						}
						className='w-10 h-10 rounded-full'
					/>

					<div className='flex flex-col'>
						<span className='font-bold text-sm'>
							{person.fullName}
						</span>

						<span className='text-slate-500 text-sm'>
							@{person.username}
						</span>
					</div>
				</Link>
			))}
		</div>
	</div>

	<form method='dialog' className='modal-backdrop'>
		<button>close</button>
	</form>
</dialog>

{/* FOLLOWERS MODAL */}
<dialog id='followers_modal' className='modal'>
	<div className='modal-box border border-gray-700'>
		<h3 className='font-bold text-lg mb-4'>
			Followers
		</h3>

		<div className='flex flex-col gap-4 max-h-96 overflow-auto'>
			{followData?.followers?.length === 0 && (
				<p className='text-sm text-slate-500'>
					No followers yet
				</p>
			)}

			{followData?.followers?.map((person) => (
				<Link
					to={`/profile/${person.username}`}
					key={person._id}
					className='flex items-center gap-3 hover:bg-secondary p-2 rounded-lg'
				>
					<img
						src={
							person.profileImg ||
							"/avatar-placeholder.png"
						}
						className='w-10 h-10 rounded-full'
					/>

					<div className='flex flex-col'>
						<span className='font-bold text-sm'>
							{person.fullName}
						</span>

						<span className='text-slate-500 text-sm'>
							@{person.username}
						</span>
					</div>
				</Link>
			))}
		</div>
	</div>

	<form method='dialog' className='modal-backdrop'>
		<button>close</button>
	</form>
</dialog>
<div className='flex w-full border-b border-gray-700 mt-4 overflow-x-auto'>
	<div
		className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
		onClick={() => setFeedType("posts")}
	>
		Posts
		{feedType === "posts" && (
			<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
		)}
	</div>

	<div
		className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
		onClick={() => setFeedType("likes")}
	>
		Likes
		{feedType === "likes" && (
			<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
		)}
	</div>

	<div
		className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
		onClick={() => setFeedType("saved")}
	>
		Saved
		{feedType === "saved" && (
			<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
		)}
	</div>

	<div
		className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
		onClick={() => setFeedType("reposts")}
	>
		Reposts
		{feedType === "reposts" && (
			<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
		)}
	</div>
</div>
						</>
					)}

					<Posts feedType={feedType} username={username} userId={user?._id} />
				</div>
			</div>
		</>
	);
};
export default ProfilePage;
