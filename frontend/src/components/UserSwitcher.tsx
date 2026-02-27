import React, { useState, useEffect, useCallback } from "react";
import { tracker, resetDomainUserId } from "../snowplow";
import { usePersonalization } from "../contexts/PersonalizationContext";

interface UserSwitcherProps {
  className?: string;
}

function UserSwitcher({ className = "" }: UserSwitcherProps) {
  const { narrative, narrativeLoading, narrativeError, refreshNarrative } =
    usePersonalization();
  const [domainUserId, setDomainUserId] = useState<string | null>(null);

  const readDomainUserId = useCallback(() => {
    setDomainUserId(tracker?.getDomainUserId() ?? null);
  }, []);

  // Read on mount and whenever the narrative refreshes (proxy for "tracker ready")
  useEffect(() => {
    readDomainUserId();
  }, [readDomainUserId, narrative]);

  const handleReset = () => {
    resetDomainUserId();
    // Give the tracker a moment to regenerate the cookie, then re-read & refresh
    setTimeout(() => {
      readDomainUserId();
      refreshNarrative();
    }, 100);
  };

  const narrativeText: string | null = narrative?.narrative ?? null;
  const intents: string[] = narrative?.intents ?? [];

  return (
    <div className={`user-switcher ${className}`}>
      <div className="user-switcher-header">
        <h3>⚙️ Admin</h3>
      </div>

      <div className="admin-domain-user">
        <div className="admin-row">
          <span className="admin-label">domain_userid</span>
          <span className="admin-domain-value" title={domainUserId ?? ""}>
            {domainUserId ? (
              <code>{domainUserId}</code>
            ) : (
              <em className="admin-no-value">not set</em>
            )}
          </span>
        </div>
        <button className="admin-reset-btn" onClick={handleReset}>
          Reset domain_userid
        </button>
      </div>

      <div className="session-narrative">
        <div className="session-narrative-header">
          <span className="session-narrative-title">Session Narrative</span>
          {narrativeLoading && <span className="narrative-loading-dot" />}
        </div>

        {narrativeError ? (
          <p className="narrative-error">{narrativeError}</p>
        ) : narrativeText ? (
          <p className="narrative-text">{narrativeText}</p>
        ) : (
          <p className="narrative-empty">No session narrative yet.</p>
        )}

        {intents.length > 0 && (
          <div className="inferred-intents">
            <div className="inferred-intents-label">Inferred intents</div>
            <div className="intents-list">
              {intents.map((intent, i) => (
                <span key={i} className="intent-tag">
                  {intent}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSwitcher;
