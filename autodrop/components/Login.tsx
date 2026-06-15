'use client';

import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { request } from "@/lib/api/handler";
import { useStorage } from "@/lib/hooks/useStorage";
import { LoginResponse } from "@/utils/interface";
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import * as Yup from 'yup';

interface Errors {
    email?: string;
    password?: string;
}

function Login() {
    const [errors, setErrors] = useState<Errors>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const { setValue: setToken } = useStorage<string>('token', 'local');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogin = async () => {
        setErrors({});
        setServerError("");
        setLoading(true);

        try {
            const schema = Yup.object().shape({
                email: Yup.string()
                    .email("Invalid Email")
                    .required("Email is required"),
                password: Yup.string()
                    .min(6, "Password must be at least 6 characters")
                    .required("Password is required"),
            });
            await schema.validate(formData, { abortEarly: false });

            const res = await request<LoginResponse>({ method: "POST", url: "/auth/login", data: formData });

            if (res.error) throw { message: res.error };

            const { token } = res;
            setToken(token);

            router.push(`/dashboard`);
        } catch (error) {
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as { message: string }).message === "string"
            ) {
                setServerError((error as { message: string }).message);
            } else if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                (error as { response?: { data?: { error?: string } } }).response?.data?.error
            ) {
                setServerError(
                    (error as { response: { data: { error: string } } }).response.data.error
                );
            } else if (error instanceof Yup.ValidationError) {
                const newErrors: Record<string, string> = {};
                error.inner.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setServerError("Something went wrong. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Animation variants for the card
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    // Animation variants for inputs
    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <motion.div
            className="max-w-md mx-auto"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
                    <CardDescription className="text-gray-600">
                        Sign in to your account to continue
                    </CardDescription>
                    {serverError && <Error message={serverError} />}
                </CardHeader>
                <CardContent className="space-y-6">
                    <motion.div
                        className="space-y-2"
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            onChange={handleInputChange}
                            value={formData.email}
                            className="rounded-lg text-gray-500 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        />
                        {errors.email && <Error message={errors.email} />}
                    </motion.div>
                    <motion.div
                        className="space-y-2 relative"
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter Password"
                            onChange={handleInputChange}
                            value={formData.password}
                            className="rounded-lg text-gray-500 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                        {errors.password && <Error message={errors.password} />}
                    </motion.div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <motion.div
                        className="w-full"
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 transition-all duration-300"
                        >
                            {loading ? <BeatLoader size={10} color="#36d7b7" /> : "Sign In"}
                        </Button>
                    </motion.div>
                    <div className="flex justify-between text-sm gap-1">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-gray-600">
                                Remember me
                            </label>
                        </div>
                        <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Forgot Password?
                        </a>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default Login;