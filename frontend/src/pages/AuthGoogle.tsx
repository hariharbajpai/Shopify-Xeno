import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function AuthGoogle() {
  const { setUserFromIdToken } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Welcome to Xenoit</CardTitle>
          <CardDescription className="text-gray-300 mt-2">
            Sign in to access your Shopify analytics dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <Alert className="bg-blue-900/30 border-blue-800">
              <ShieldAlert className="h-4 w-4 text-blue-400" />
              <AlertTitle className="text-blue-300">Secure Authentication</AlertTitle>
              <AlertDescription className="text-blue-200">
                Your data is protected with enterprise-grade security
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center py-4">
              <GoogleLogin
                onSuccess={(cred) => {
                  const idToken = cred.credential!;
                  setUserFromIdToken(idToken);
                  navigate("/dashboard", { replace: true });
                }}
                onError={() => {
                  console.error("Google login failed");
                }}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="pill"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-gray-400 mb-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Xenoit. All rights reserved.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}