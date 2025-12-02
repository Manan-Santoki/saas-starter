import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Lock, Zap, Globe, Shield } from 'lucide-react';
import { getUser } from '@/lib/db/queries';

export default async function LandingPage() {
    const user = await getUser();

    return (
        <div className="min-h-full bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                        Connect with Anyone,
                        <br />
                        <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                            Anywhere in the World
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Secure, high-quality video conferencing made simple. Create meetings instantly,
                        invite guests, and collaborate seamlessly.
                    </p>
                    <div className="flex gap-4 justify-center">
                        {user ? (
                            <Link href="/meetings">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
                                    <Video className="h-5 w-5 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-up">
                                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
                                        <Video className="h-5 w-5 mr-2" />
                                        Start Meeting Free
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button size="lg" variant="outline" className="text-lg px-8">
                                        View Pricing
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Image/Illustration Placeholder */}
                <div className="mt-16 relative">
                    <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <Video className="h-24 w-24 text-gray-400 mx-auto" />
                            <p className="text-gray-500 text-lg font-medium">Video conferencing interface preview</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything you need for great meetings
                        </h2>
                        <p className="text-xl text-gray-600">
                            Powerful features to make your video calls effortless
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-2 hover:border-orange-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                                    <Video className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle>HD Video & Audio</CardTitle>
                                <CardDescription>
                                    Crystal clear video and audio quality for professional meetings
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-blue-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Guest Join</CardTitle>
                                <CardDescription>
                                    Let anyone join your meetings without creating an account
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-green-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                                    <Lock className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Secure & Private</CardTitle>
                                <CardDescription>
                                    End-to-end encryption keeps your conversations private
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-purple-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                                    <Zap className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Instant Setup</CardTitle>
                                <CardDescription>
                                    Create and join meetings in seconds with no downloads required
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-indigo-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                                    <Globe className="h-6 w-6 text-indigo-600" />
                                </div>
                                <CardTitle>Global Reach</CardTitle>
                                <CardDescription>
                                    Connect with participants from anywhere in the world reliably
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-pink-200 transition-colors">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-pink-600" />
                                </div>
                                <CardTitle>Recording & Controls</CardTitle>
                                <CardDescription>
                                    Record meetings and moderate with powerful host controls
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <Card className="bg-gradient-to-r from-orange-600 to-blue-600 border-0 text-white">
                    <CardHeader className="text-center py-12">
                        <CardTitle className="text-4xl mb-4">Ready to get started?</CardTitle>
                        <CardDescription className="text-white/90 text-lg mb-8">
                            Join thousands of teams using VideoMeet for their daily communication
                        </CardDescription>
                        <div className="flex gap-4 justify-center">
                            <Link href={user ? "/meetings" : "/sign-up"}>
                                <Button size="lg" variant="secondary" className="text-lg px-8">
                                    {user ? "Go to Dashboard" : "Create Free Account"}
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/pricing">Pricing</Link></li>
                                <li><Link href="/meetings">Meetings</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/about">About</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/privacy">Privacy</Link></li>
                                <li><Link href="/terms">Terms</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/help">Help Center</Link></li>
                                <li><Link href="/docs">Documentation</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
                        <p>© 2025 VideoMeet. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
