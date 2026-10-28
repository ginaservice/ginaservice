/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gina/yoinks-media'],
  serverExternalPackages: ['ffmpeg-static'],
}

export default nextConfig
