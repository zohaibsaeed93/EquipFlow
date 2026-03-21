import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  useMySlots,
  useBookings,
  useEquipment,
  useUserCertifications,
} from "../hooks/useScheduling";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: slots = [] } = useMySlots(user?.id || "");
  const { data: bookings = [] } = useBookings();
  const { data: equipment = [] } = useEquipment();
  const { data: userCertifications = [] } = useUserCertifications(
    user?.id || "",
  );

  const isAdmin = user?.role === "admin";

  const availableSlots = slots.filter((s) => !s.isBooked);
  const activeBookings = bookings.filter((b) => b.status === "booked");

  const userCertIds = new Set(userCertifications.map((cert) => cert.id));

  const equipmentMissingCerts = equipment.map((item) => {
    const requirements = item.requirements || [];
    const missing = requirements
      .map((req) => req.certification)
      .filter((cert): cert is NonNullable<typeof cert> => !!cert)
      .filter((cert) => !userCertIds.has(cert.id));

    return {
      equipment: item,
      missing,
    };
  });

  // Find next upcoming booking
  const upcomingBooking = activeBookings
    .filter((b) => b.slot && new Date(b.slot.startTime) > new Date())
    .sort(
      (a, b) =>
        new Date(a.slot!.startTime).getTime() -
        new Date(b.slot!.startTime).getTime(),
    )[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const certReadyCount = equipmentMissingCerts.filter(
    (e) => e.missing.length === 0,
  ).length;

  const stats = [
    {
      label: "Available Equipment",
      value: equipment.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z" />
        </svg>
      ),
      color: "var(--accent)",
      mutedColor: "var(--accent-muted)",
      to: "/equipment",
    },
    {
      label: "Active Bookings",
      value: activeBookings.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: "var(--success)",
      mutedColor: "var(--success-muted)",
      to: "/bookings",
    },
    {
      label: "Upcoming Slots",
      value: availableSlots.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "var(--warning)",
      mutedColor: "var(--warning-muted)",
      to: "/availability",
    },
    {
      label: "Cert. Ready",
      value: `${certReadyCount}/${equipment.length}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      color: "var(--info)",
      mutedColor: "var(--info-muted)",
      to: "/book",
    },
  ];

  const quickActions = isAdmin
    ? [
      {
        label: "Manage Equipment",
        to: "/equipment",
        primary: true,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z" />
          </svg>
        ),
      },
      {
        label: "Create Slot",
        to: "/availability",
        primary: false,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ),
      },
      {
        label: "Review Bookings",
        to: "/bookings",
        primary: false,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        ),
      },
    ]
    : [
      {
        label: "Book Equipment",
        to: "/book",
        primary: true,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        label: "View Bookings",
        to: "/bookings",
        primary: false,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        ),
      },
      {
        label: "Create Slot",
        to: "/availability",
        primary: false,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ),
      },
    ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {getGreeting()},{" "}
            <span style={{ color: "var(--accent)" }}>{user?.name}</span>
          </h1>
          <p className="mt-1" style={{ color: "var(--text-tertiary)" }}>
            {isAdmin
              ? "Manage equipment, slots, and bookings across the platform"
              : "Your equipment booking overview"}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.to)}
              className="group relative rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                boxShadow: `0 4px 16px var(--card-shadow)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.boxShadow = `0 8px 24px var(--card-shadow), 0 0 0 1px ${stat.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--card-border)";
                e.currentTarget.style.boxShadow = `0 4px 16px var(--card-shadow)`;
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: stat.mutedColor,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <span
                className="block text-3xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Actions + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Actions
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  variant={action.primary ? "primary" : "secondary"}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Upcoming / My Certifications */}
          <Card>
            {upcomingBooking ? (
              <>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Next Booking
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      Equipment
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {upcomingBooking.slot?.equipment?.name || "—"}
                    </span>
                  </div>
                  <div
                    className="border-t"
                    style={{ borderColor: "var(--divider)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      When
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {upcomingBooking.slot
                        ? new Date(upcomingBooking.slot.startTime).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
                        )
                        : "—"}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full mt-2"
                    onClick={() => navigate("/bookings")}
                  >
                    View All Bookings
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isAdmin ? "System Overview" : "My Certifications"}
                </h2>
                {isAdmin ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Total equipment
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {equipment.length}
                      </span>
                    </div>
                    <div
                      className="border-t"
                      style={{ borderColor: "var(--divider)" }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Active bookings
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {activeBookings.length}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-2"
                      onClick={() => navigate("/equipment")}
                    >
                      Manage Equipment
                    </Button>
                  </div>
                ) : userCertifications.length === 0 ? (
                  <div className="flex flex-col items-center py-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: "var(--accent-muted)" }}
                    >
                      <svg className="w-6 h-6" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      No certifications yet
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Contact admin to get certified
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userCertifications.map((cert) => (
                      <Badge key={cert.id} variant="success">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {cert.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Equipment Status Grid + Certification Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment Status Grid */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z" />
              </svg>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Equipment Status
              </h2>
            </div>
            {equipment.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--accent-muted)" }}
                >
                  <svg className="w-6 h-6" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.32 0l-5.66 5.66z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L7.75 21h8.34l-3.67-5.83z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  No equipment registered
                </p>
                <p className="text-xs mt-0.5 mb-3" style={{ color: "var(--text-tertiary)" }}>
                  {isAdmin ? "Add your first equipment" : "Check back later"}
                </p>
                {isAdmin && (
                  <Button onClick={() => navigate("/equipment")}>
                    Add Equipment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {equipment.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {item.requirements?.length
                            ? `${item.requirements.length} cert${item.requirements.length > 1 ? "s" : ""} required`
                            : "No certs required"}
                        </span>
                        {item.dependencies && item.dependencies.length > 0 && (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0.5">
                            {item.dependencies.length} dep{item.dependencies.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="success">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--success)" }}
                      />
                      Active
                    </Badge>
                  </div>
                ))}
                {equipment.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => navigate("/equipment")}
                  >
                    View all {equipment.length} equipment →
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Certification Gaps */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" style={{ color: "var(--warning)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Certification Gaps
              </h2>
            </div>
            {equipmentMissingCerts.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--success-muted)" }}
                >
                  <svg className="w-6 h-6" style={{ color: "var(--success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  All clear!
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  No certification gaps found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {equipmentMissingCerts.map(({ equipment: item, missing }) => (
                  <div
                    key={item.id}
                    className="rounded-xl border px-4 py-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </p>
                      <Badge variant={missing.length ? "warning" : "success"}>
                        {missing.length ? "Missing" : "Ready"}
                      </Badge>
                    </div>
                    {missing.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {missing.map((cert) => (
                          <Badge key={cert.id} variant="danger">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {cert.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p
                        className="mt-2 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        You meet all requirements.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
