type AnyObj = Record<string, any>;

function getAttr(attrs: AnyObj[] | undefined, name: string) {
  if (!attrs) return undefined;
  return attrs.find((a) => a.Name === name || a.name === name)?.Value;
}

export function normalizeUsersPayload(data: any): Array<AnyObj> {
  const raw =
    data?.users ??
    data?.Users ??
    (Array.isArray(data) ? data : []) ??
    [];

  return raw.map((u: AnyObj) => {
    const email =
      getAttr(u.Attributes, "email") ??
      u.email ??
      u.Email ??
      u.user_email;

    // Priority order for name extraction:
    // 1. Direct name attribute from Cognito
    // 2. given_name + family_name combination
    // 3. preferred_username or nickname
    // 4. Direct name field on the user object
    // 5. Username field (only if it looks like a real name)
    // 6. Fallback to "User"
    
    const cognitoName = getAttr(u.Attributes, "name");
    
    const combinedName = [
      getAttr(u.Attributes, "given_name"),
      getAttr(u.Attributes, "family_name"),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const preferred =
      getAttr(u.Attributes, "preferred_username") ||
      getAttr(u.Attributes, "nickname");

    // Determine the best name to use
    // NEVER derive name from email - only use actual name fields
    let name = cognitoName || combinedName || preferred;
    
    // If name is still empty, try direct name field (not email-derived)
    if (!name && u.name && !u.name.includes("@")) {
      name = u.name;
    }
    
    // If name is still empty and we only have Username (which might be a UUID or email),
    // try to use the Username only if it looks like a real name (not email, not UUID)
    if (!name && u.Username) {
      const username = u.Username;
      // Check if it's not an email and not a UUID-like string
      const isEmail = username.includes("@");
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
      // Also check if it looks like an email prefix (all lowercase, short)
      const looksLikeEmailPrefix = /^[a-z0-9._-]+$/i.test(username) && username.length < 30;
      
      if (!isEmail && !isUUID && !looksLikeEmailPrefix) {
        name = username;
      }
    }
    
    // Final fallback - show "User" instead of deriving from email
    if (!name) {
      name = "User";
    }

    const cognitoGroups = u?.Groups || u?.groups || u?.cognitoGroups;

    const group =
      (Array.isArray(cognitoGroups) && cognitoGroups[0]) ||
      getAttr(u.Attributes, "custom:group") ||
      u.group ||
      "User";

    return {
      email,
      name,
      username: u.Username,
      group,
      // Keep additional fields for display fallback
      given_name: getAttr(u.Attributes, "given_name"),
      family_name: getAttr(u.Attributes, "family_name"),
      preferred_username: preferred,
    };
  });
}

export function normalizeScoresPayload(data: any): Array<AnyObj> {
  const raw =
    data?.scores ??
    data?.Items ??
    (Array.isArray(data) ? data : []) ?? [];

  return raw.map((s: AnyObj) => ({
    response_id:
      s.result_id ||
      s.response_id ||
      s.id ||
      s.responseId ||
      s.pk ||
      s.PK ||
      "N/A",
    quiz_id: s.quiz_id || s.quizId || s.sk || s.SK || "N/A",
    quiz_title: s.quiz_title || s.title || s.quizTitle || null,
    quiz_topic: s.quiz_topic || s.topic || s.quizTopic || null,
    user_name:
      s.user_name ||
      s.username ||
      s.user ||
      s.name ||
      "N/A",
    user_email: s.user_email || s.email,
    score: s.score ?? s.marks ?? s.total ?? s.result ?? "N/A",
    submitted_at: s.submitted_at || s.submittedAt || s.submitted_date || null,
    answers: s.answers || s.response || s.responses || null,
  }));
}

export function generateCreatedAt() {
  const d = new Date();
  const pad = (n: number, size = 2) => String(n).padStart(size, "0");

  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds()
  )}.${String(d.getUTCMilliseconds()).padStart(3, "0")}000`;
}
