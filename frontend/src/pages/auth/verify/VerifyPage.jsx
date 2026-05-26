import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X";

const VerifyPage = () => {
	const [code, setCode] = useState("");
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			return data;
		},
		onSuccess: () => {
			toast.success("Email verified successfully 🎉");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			navigate("/");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>
			
			{/* SVG SIDE */}
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>

			{/* FORM SIDE */}
			<div className='flex-1 flex flex-col justify-center items-center'>
				<div className='flex flex-col gap-4 w-80'>
					<XSvg className='w-20 lg:hidden fill-white mx-auto' />

					<h1 className='text-white text-2xl font-bold text-center'>
						Enter Verification Code
					</h1>

					<input
						type='text'
						placeholder='Enter 6-digit code'
						className='input input-bordered'
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>

					<button className='btn btn-primary' onClick={() => mutate()}>
						{isPending ? "Verifying..." : "Verify"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default VerifyPage;