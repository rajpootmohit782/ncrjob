import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function useEmployer() {
  const { user } = useAuth();

  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployer = useCallback(async () => {
    if (!user) {
      setEmployer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("employers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setError("Unable to load employer profile.");
    } else {
      setEmployer(data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEmployer();
  }, [fetchEmployer]);

  return {
    employer,
    loading,
    error,
    refetch: fetchEmployer,
  };
}