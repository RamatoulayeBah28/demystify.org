/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      // Collaborator photos — anticipating Supabase Storage public URLs,
      // since that's where the rest of this app's backend content lives.
      // Adjust/add a pattern here if photos end up hosted elsewhere.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
