import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";

import { auth, provider } from "../../../firebase/firebase";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, username, fullName, password }),
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to create account");
				console.log(data);
				return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Account created successfully. Check your email for verification code.");

			navigate("/verify");

			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault(); // page won't reload
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
const handleGoogleLogin = async () => {
	try {
		const result = await signInWithPopup(
			auth,
			provider
		);

		const user = result.user;

		const res = await fetch(
			"/api/auth/google",
			{
				method: "POST",
				headers: {
					"Content-Type":
						"application/json",
				},
				body: JSON.stringify({
					email: user.email,
					fullName: user.displayName,
					profileImg: user.photoURL,
				}),
			}
		);

		const data = await res.json();

		if (!res.ok) {
			throw new Error(
				data.error ||
					"Google login failed"
			);
		}

		queryClient.invalidateQueries({
			queryKey: ["authUser"],
		});

	} catch (error) {
		console.log(error.message);
	}
};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input
								type='text'
								className='grow '
								placeholder='Username'
								name='username'
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Sign up"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
					<button 
					onClick={handleGoogleLogin}
					type='button'
					className='flex items-center justify-center gap-3 w-full border border-[#536471] hover:bg-[#181818] text-white font-bold py-3 rounded-full transition-all duration-300'
					>
						<img
						src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
						alt='Google'
						className='w-5 h-5'
						/>

							Continue with Google
					</button>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;
