import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Database } from "lucide-react";

/**
 * @typedef {Object} Status
 * @property {string} updated_at
 * @property {Dependencies} dependencies */

/**
 * @typedef {Object} Dependencies
 * @property {Database} database */

/**
 * @typedef {Object} Database
 * @property {string} version
 * @property {number} max_connections
 * @property {number} open_connections */

/**
 * @param {Object} props
 * @param {Status} props.status
 * @param {boolean} props.isLoading */
export function StatusCard({ status, isLoading }) {
  /**
   * @param {string} dateString - The date string to be formatted.
   * @returns {string} The formatted date string. */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2" />
            Last Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-full" />
          ) : (
            <p className="text-lg">{formatDate(status.updated_at)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Version:</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <Badge variant="secondary">
                  <code className="text-sm font-mono">
                    {status.dependencies.database.version}
                  </code>
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Connections:</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <code className="text-sm font-mono">
                    {status.dependencies.database.open_connections} /{" "}
                    {status.dependencies.database.max_connections}
                  </code>
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <Progress
                  value={
                    (status.dependencies.database.open_connections /
                      status.dependencies.database.max_connections) *
                    100
                  }
                  className="w-full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
