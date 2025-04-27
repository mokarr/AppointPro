import { NextResponse } from "next/server";
import { db } from "@/lib/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
    try {
        // Check Prisma connection
        await db.$queryRaw`SELECT 1`;

        // Check Supabase connection (optional - can be removed if only using Prisma)
        const supabase = createSupabaseAdmin();
        await supabase.from('_prisma_migrations').select('*').limit(1);

        return NextResponse.json({
            status: "ok",
            database: "connected",
            message: "Database connection successful",
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        console.error("Database health check failed:", error);

        return NextResponse.json({
            status: "error",
            database: "disconnected",
            message: error instanceof Error ? error.message : "Unknown database error",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 