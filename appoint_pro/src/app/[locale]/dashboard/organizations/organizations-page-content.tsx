'use client';

import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Building, Users, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Organization {
    id: string;
    name: string;
    branche?: string;
    description?: string;
    createdAt: Date;
    Employee?: { id: string }[];
    locations?: { id: string }[];
}

interface OrganizationsPageContentProps {
    user: {
        id: string;
        email: string;
        organizationId: string;
        organization: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            subdomain: string | null;
            branche: string;
            stripeCustomerId: string | null;
            hasActiveSubscription: boolean;
        };
    };
    organization: Organization;
}

export default function OrganizationsPageContent({ organization }: OrganizationsPageContentProps) {
    const t = useTranslations('common');

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t('organizations')}
                description={t('header.organizations.description')}
                action={
                    <Button>
                        {t('header.organizations.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            {t('header.organizations.myOrganization')}
                        </h2>
                        <OrganizationCard organization={organization} isCurrentOrg={true} />
                    </div>
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
}

interface OrganizationCardProps {
    organization: Organization;
    isCurrentOrg: boolean;
}

function OrganizationCard({ organization, isCurrentOrg }: OrganizationCardProps) {
    const t = useTranslations('common');

    return (
        <Card className={isCurrentOrg ? "border-primary" : ""}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{organization.name}</CardTitle>
                        <CardDescription>{organization.branche}</CardDescription>
                    </div>
                    {isCurrentOrg && (
                        <div className="flex items-center text-primary text-sm font-medium">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>{t('header.organizations.current')}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm">{organization.description}</p>

                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{organization.Employee?.length || 0} {t('header.organizations.employees')}</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{organization.locations?.length || 0} {t('header.organizations.locations')}</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-1" />
                        <span>{t('header.organizations.created')} {new Date(organization.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/${organization.name}`}>
                        {t('header.organizations.viewOrganization')}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
} 