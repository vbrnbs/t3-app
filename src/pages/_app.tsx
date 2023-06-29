import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps, AppType } from "next/app";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
 
export default api.withTRPC(MyApp);