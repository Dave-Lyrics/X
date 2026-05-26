import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			return data;
		},
		onSuccess: () => toast.success("Check your email 📩"),
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>

			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>

			<div className='flex-1 flex flex-col justify-center items-center'>
				<div className='flex flex-col gap-4 w-80'>
					<XSvg className='w-20 lg:hidden fill-white mx-auto' />

					<h1 className='text-white text-xl text-center'>
						Forgot Password
					</h1>

					<input
						type='email'
						placeholder='Enter your email'
						className='input input-bordered'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<button className='btn btn-primary' onClick={() => mutate()}>
						{isPending ? "Sending..." : "Send Reset Link"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;