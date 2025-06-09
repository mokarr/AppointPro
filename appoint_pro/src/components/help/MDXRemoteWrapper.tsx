import { MDXRemote } from 'next-mdx-remote-client/rsc';

interface MDXRemoteWrapperProps {
  source: any;
}

export default function MDXRemoteWrapper({ source }: MDXRemoteWrapperProps) {
  return <MDXRemote {...source} />;
} 