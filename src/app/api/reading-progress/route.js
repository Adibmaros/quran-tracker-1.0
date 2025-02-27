import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  // Validate authenticated user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const progress = await prisma.readingProgress.findMany({
        where: { userId: user.id },
      });

      return res.status(200).json(progress);
    } catch (error) {
      return res.status(500).json({ error: "Error fetching reading progress" });
    }
  } else if (req.method === "POST") {
    const { juzNumber, isCompleted, notes } = req.body;

    try {
      const result = await prisma.readingProgress.upsert({
        where: {
          userId_juzNumber: {
            userId: user.id,
            juzNumber: parseInt(juzNumber),
          },
        },
        update: {
          isCompleted,
          notes,
          lastReadDate: isCompleted ? new Date() : null,
        },
        create: {
          userId: user.id,
          juzNumber: parseInt(juzNumber),
          isCompleted,
          notes,
          lastReadDate: isCompleted ? new Date() : null,
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error updating reading progress" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
