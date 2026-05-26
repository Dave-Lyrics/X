import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X";

const ResetPasswordPage = () => {
	const { token } = useParams();
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/auth/reset-password/${token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			return data;
		},
		onSuccess: () => {
			toast.success("Password reset successful 🔐");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			navigate("/");
		},
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
						Reset Password
					</h1>

					<input
						type='password'
						placeholder='Enter new password'
						className='input input-bordered'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<button className='btn btn-primary' onClick={() => mutate()}>
						{isPending ? "Resetting..." : "Reset Password"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;