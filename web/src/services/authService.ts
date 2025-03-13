import { useDispatch } from "react-redux";
import { showGlobalSnackbar } from "../common/snackbarProvider";
import { destroyContext } from "../features/auth/authSlice";
import { checkUserLoggedIn, InitialBillingInfoUpdateRequest, InitialBillingInfoUpdateResponse, InitialPageBillingInfo, InitialPageUserInfo, InitialSetPasswordRequest, InitialSetPasswordResponse, InitialUserInfoRequest, InitialUserInfoResponse, LoginRequest, LoginResponseWithMFA, LoginResponseWithoutMFA, LogoutResponse, MFASetupResponse, RefreshTokenResponse, userDetailsInfoResponse, ValidatedLoginResponseAfterMfa, ValidatedLoginResponseAfterMfaFirstTime } from "../types";
import axiosClient from "../utils/axiosClient";
import { redirect, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export class AuthService {
  async login(body: LoginRequest) {
    const response = await axiosClient.post<
      LoginResponseWithMFA | LoginResponseWithoutMFA
    >("/auth/login", body);

    return response.data;
  }

  async refreshToken() {
    try {
      const response = await axiosClient.post<RefreshTokenResponse>(
        "/auth/generate-access-token",
        {}
      );

      return response.data;
    } catch (error: any) {
      throw new Error("Network or server error. Please try again later.");
    }
  }

  async initialUserInfoSetup(body: InitialUserInfoRequest) {
    const response = await axiosClient.patch<InitialUserInfoResponse>(
      "/user/info/update",
      body
    );

    return response.data;
  }

  async initialBillingInfoUpdate(body: InitialBillingInfoUpdateRequest) {
    try {
      const response =
        await axiosClient.patch<InitialBillingInfoUpdateResponse>(
          "/account/billing/update",
          body
        );

      return response.data;
    } catch (err: any) {
      showGlobalSnackbar(err.response.data.msg);
      throw new Error("Network or server error. Please try again later.");
    }
  }

  async initialSetPassword(body: InitialSetPasswordRequest) {
    try {
      const response = await axiosClient.patch<InitialSetPasswordResponse>(
        "/user/set/password",
        body
      );

      return response.data;
    } catch (error: any) {
      // const err = error as AxiosError
      return error?.response;

      throw new Error("Network or server error. Please try again later.");
    }
  }

  async mfaVerification(token: string) {
    const response = await axiosClient.post<ValidatedLoginResponseAfterMfa>(
      "/user/mfa/validate",
      { token }
    );

    return response.data;
  }
  async mfaVerificationFirstTime(token: string) {
    const response = await axiosClient.post<ValidatedLoginResponseAfterMfaFirstTime>(
      "/user/mfa/initial/setup/validate",
      { token }
    );

    return response.data;
  }
  async getUserInfo() {
    try {
      const response = await axiosClient.get<InitialPageUserInfo>("/user/info");

      return response.data;
    } catch (error: any) {
      return error
      
      showGlobalSnackbar(error.response.data.msg, "error");
     
    }
  }
  async getBillingInfo() {
    try {
      const response = await axiosClient.get<InitialPageBillingInfo>(
        "/account/billing/info"
      );

      return response.data;
    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, "error");
      throw new Error(
        error.response.data.msg || "An error occurred during login."
      );
    }
  }
  async mfaSetup() {
    const response = await axiosClient.get<MFASetupResponse>("/user/mfa/setup");

    return response.data;
  }
  async checkUserLoggedIn() {
    const response = await axiosClient.get<checkUserLoggedIn>("/auth/me");
    return response.data;
  }

  async logout() {
    try {
      try {
        const response = await axiosClient.get<LogoutResponse>("/auth/logout");
        showGlobalSnackbar(response.data.msg, "success");
        return response.data;
      } catch (error: any) {
        if (error.response) {
          showGlobalSnackbar(error.response.data.msg, "error");
          throw new Error(
            error.response.data.msg || "An error occurred during login."
          );
        } else {
          showGlobalSnackbar(
            "Network or server error. Please try again later.",
            "error"
          );
          throw new Error("Network or server error. Please try again later.");
        }
      }
    } catch (error: any) {
      throw new Error("Network or server error. Please try again later.");
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      const response = await axiosClient.post("/auth/sendResetPasswordEmail", {
        email,
      });
      return response.data;
    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, "error");
      throw new Error(
        error.response.data.msg || "An error occurred during login."
      );
    }
  }

  async validatePasswordResetToken(token: string) {
    try {
      const response = await axiosClient.get(
        "/auth/validateResetPasswordToken",
        {
          params: {
            token,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, "error");
      throw new Error(
        error.response.data.msg || "An error occurred during login."
      );
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const response = await axiosClient.patch("/auth/resetPassword", {
        token,
        password,
      });
      return response.data;
    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, "error");
      throw new Error(
        error.response.data.msg || "An error occurred during login."
      );
    }
  }

  async resetPassword2FA(email: string, code: string) {
    try {
      const response = await axiosClient.patch("/auth/resetPassword2FA", {
        email,
        code,
      });
      return response.data;
    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, "error");
      throw new Error(
        error.response.data.msg || "An error occurred during login."
      );
    }
  }

  async getUserInfoDetails() {
    try {
      const response = await axiosClient.get<userDetailsInfoResponse>('/user/details')

      return response.data

    } catch (error: any) {
      showGlobalSnackbar(error.response.data.msg, 'error')
      throw new Error(error.response.data.msg || 'An error occurred during login.');
    }
  }
}

const authService = new AuthService();

export default authService;
