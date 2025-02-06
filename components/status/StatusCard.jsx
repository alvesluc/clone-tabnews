import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatusCard({ status, isLoading, formatDate }) {
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
