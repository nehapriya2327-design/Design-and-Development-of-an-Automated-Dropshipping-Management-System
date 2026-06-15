'use client';

import Login from '@/components/Login';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
    // Animation variants for the left section (login)
    const leftVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    // Animation variants for the right section (image)
    const imageVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <main className="flex flex-col lg:flex-row max-w-7xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                {/* Left Section - Login Component */}
                <motion.section
                    id="left"
                    className="w-full lg:w-1/2 p-8 md:p-12 flex items-center justify-center"
                    variants={leftVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="w-full max-w-md">
                        <motion.div
                            className="text-center mb-8"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
                        </motion.div>
                        <Login />
                    </div>
                </motion.section>

                {/* Right Section - Image with Animation */}
                <motion.section
                    id="right"
                    className="hidden lg:block w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-12 relative overflow-hidden"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/50 to-purple-600/50 mix-blend-overlay" />
                    <motion.div
                        className="relative flex items-center justify-center h-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    >
                        <Image
                            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg"
                            alt="Authentication illustration"
                            width={500}
                            height={500}
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                    <motion.div
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                            ],
                        }}
                        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    />
                </motion.section>
            </main>
        </div>
    );
}