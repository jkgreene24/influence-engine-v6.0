import { redirect } from 'next/navigation';
import { REDIRECT_CONFIG } from '@/app/config/redirects';

export default function TesterPage() {
  // Get the target URL for this route
  const targetUrl = REDIRECT_CONFIG['/tester'];
  
  if (targetUrl) {
    // Redirect to the target URL
    redirect(targetUrl);
  }
  
  // Fallback if no redirect is configured
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirect Not Configured
        </h1>
        <p className="text-gray-600">
          The redirect for this page has not been configured yet.
        </p>
      </div>
    </div>
  );
}
