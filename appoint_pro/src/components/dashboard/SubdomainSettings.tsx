'use client';

import { useState } from 'react';
import { updateOrganizationSubdomain, generateSubdomainSuggestion } from '@/services/organization';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SubdomainSettingsProps {
    organization: {
        id: string;
        name: string;
        subdomain: string | null;
    };
}

export default function SubdomainSettings({ organization }: SubdomainSettingsProps) {
    const [subdomain, setSubdomain] = useState(organization.subdomain || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleEditClick = () => {
        if (!organization.subdomain) {
            // If no subdomain exists, generate one from the organization name
            const suggestion = generateSubdomainSuggestion(organization.name);
            setSubdomain(suggestion);
        }
        setIsEditing(true);
    };

    const handleCancel = () => {
        setSubdomain(organization.subdomain || '');
        setIsEditing(false);
        setError('');
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError('');

            const result = await updateOrganizationSubdomain(organization.id, subdomain);

            if (result.success) {
                toast({
                    title: 'Subdomain updated',
                    description: 'Your organization subdomain has been updated successfully.',
                    duration: 5000,
                });
                setIsEditing(false);
            } else {
                setError(result.message || 'Failed to update subdomain');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow alphanumeric characters and hyphens
        const sanitizedValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSubdomain(sanitizedValue);
    };

    const getSubdomainPreview = () => {
        const domain = process.env.NODE_ENV === 'production' ? 'appointpro.com' : 'localhost:3000';
        return `${subdomain || '[subdomain]'}.${domain}`;
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle>Custom Subdomain</CardTitle>
                </div>
                <CardDescription>
                    Set a custom subdomain for your organization. This allows your clients to access your booking page directly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subdomain">Subdomain</Label>
                            <div className="flex">
                                <Input
                                    id="subdomain"
                                    value={subdomain}
                                    onChange={handleSubdomainChange}
                                    placeholder="your-organization"
                                    className="rounded-r-none"
                                    aria-label="Subdomain"
                                />
                                <div className="bg-muted px-3 py-2 text-sm border border-l-0 border-input rounded-r-md flex items-center">
                                    .{process.env.NODE_ENV === 'production' ? 'appointpro.com' : 'localhost:3000'}
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Your clients will access your booking page at: <span className="font-medium">{getSubdomainPreview()}</span>
                        </div>

                        {error && (
                            <div className="flex items-center text-destructive text-sm mt-2">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Current Subdomain</div>
                        <div className="flex items-center">
                            {organization.subdomain ? (
                                <>
                                    <Globe className="h-4 w-4 mr-2 text-primary" />
                                    <span className="font-medium">{getSubdomainPreview()}</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">No subdomain set</span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleEditClick}>
                        {organization.subdomain ? 'Edit Subdomain' : 'Set Subdomain'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
} 