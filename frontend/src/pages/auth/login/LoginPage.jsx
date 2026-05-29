import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signInWithPopup } from "firebase/auth";

import { auth, provider } from "../../../firebase/firebase";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const queryClient = useQueryClient();

	const {
		mutate: loginMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ username, password }) => {
			try {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, password }),
				});

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			// refetch the authUser
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
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

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

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
					<Link to="/forgot-password" className="text-sm text-blue-400">
						Forgot Password?
					</Link>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
					<button 
					onClick={handleGoogleLogin}
					type='button'
					className='flex items-center justify-center gap-3 w-70 border border-[#536471] hover:bg-[#181818] text-white font-bold py-3 rounded-full transition-all duration-300'
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
export default LoginPage;
