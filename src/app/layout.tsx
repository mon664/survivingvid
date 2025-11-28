import './globals.css'
import Link from 'next/link'
import { Menu } from 'lucide-react'

export const metadata = {
  title: 'SurvivingVid - AI 비디오 생성 플랫폼',
  description: 'AI로 쇼츠, 스토리, 전문 비디오를 손쉽게 만들어보세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Navigation Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">SurvivingVid</span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-8">
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    홈
                  </Link>
                  <Link
                    href="/shorts"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    쇼츠 생성
                  </Link>
                  <Link
                    href="/story"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    스토리 생성
                  </Link>
                  <Link
                    href="/templates"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    템플릿
                  </Link>
                </nav>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button className="text-gray-500 hover:text-gray-700 p-2">
                    <Menu size={24} />
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link
                    href="/"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    홈
                  </Link>
                  <Link
                    href="/shorts"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    쇼츠 생성
                  </Link>
                  <Link
                    href="/story"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    스토리 생성
                  </Link>
                  <Link
                    href="/templates"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    템플릿
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-gray-600">
                <p>&copy; 2024 SurvivingVid. All rights reserved.</p>
                <div className="mt-2 flex justify-center space-x-6">
                  <Link href="/api/health" className="text-gray-500 hover:text-gray-700">
                    API 상태
                  </Link>
                  <Link href="/templates" className="text-gray-500 hover:text-gray-700">
                    도움말
                  </Link>
                  <a href="https://github.com/mon664/survivingvid" className="text-gray-500 hover:text-gray-700">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}