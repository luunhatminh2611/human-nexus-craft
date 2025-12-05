import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import { Dropdown } from "@/shared/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/shared/components/ui/dropdown/DropdownItem";
import { UserRole } from "../types";
import { ChevronDown, Shield, UserCog, Users } from "lucide-react";
import { EyeCloseIcon, EyeIcon } from "@/assets/icons";
import { ROUTES } from "@/shared/constants/routes";
import { toast } from "sonner";
import { authService } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/employees/hooks/useAuth";
import { Button } from "@/shared/components/ui/button/Button2";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ value: UserRole; label: string; icon: typeof Shield; description: string; empId?: string } | null>(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const { login } = useAuthStore();

  const navigate = useNavigate();

  const navigateByRoles = (userRoles: string) => {
    if (!userRoles || userRoles.length === 0) {
      toast.error('Không xác định được vai trò người dùng');
      navigate('/');
      return;
    }

    // Check for ROLE_ADMIN first (highest priority)
    if (userRoles === 'ADMIN') {
      navigate(ROUTES.ADMIN_DASHBOARD);
      return;
    }

    // Check for HEAD_DEPARTMENT
    if (userRoles === 'MANAGER') {
      navigate(ROUTES.EMPLOYEE_PROFILE);
      return;
    }

    // Check for EMPLOYEE
    if (userRoles==='EMPLOYEE') {
      navigate(ROUTES.EMPLOYEE_PROFILE);
      return;
    }

    // Default fallback if no recognized role
    toast.warning('Vai trò không được nhận diện, chuyển về trang chủ');
    navigate('/');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!username.trim()) {
      toast.error('Vui lòng nhập tài khoản');
      return;
    }

    if (!password.trim()) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Sử dụng login từ useAuthStore (Redux)
      const result = await login(username, password);
      
      if (result.success && result.data) {
        toast.success('Đăng nhập thành công!');
        
        // Navigate dựa trên role
        navigateByRoles(result.data.user.roles);
      } else {
        toast.error(result.error || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-1">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
          </div>
          <div>
            <div className="relative py-3 sm:py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Tài khoản <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Nhập tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Mật khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Bạn chưa có tài khoản hãy liên hệ với quản trị viên để được tạo tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}