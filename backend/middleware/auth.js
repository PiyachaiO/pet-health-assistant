const { supabase } = require("../config/supabase")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    // Fetch user from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = userData
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const userRoles = Array.isArray(roles) ? roles : [roles]
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
}
