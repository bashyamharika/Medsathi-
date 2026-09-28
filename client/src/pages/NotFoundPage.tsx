import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card, CardTitle, CardContent } from '../components/ui/Card.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card padding="xl" className="max-w-md text-center">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-stone-900">
            Page Not Found
          </CardTitle>
          <p className="text-stone-600 text-sm leading-relaxed">
            The page you are looking for doesn't exist or is not part of the MedSathi Phase 1 foundation.
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button
                variant="primary"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
