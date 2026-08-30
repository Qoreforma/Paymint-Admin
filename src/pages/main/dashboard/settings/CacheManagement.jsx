import React, { useState } from "react";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, BlockDes, Button, Col, Row, Icon } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import { useGetCacheStats, useFlushCache } from "../../../../api/cache";
import Swal from "sweetalert2";
import { Card, Spinner } from "reactstrap";

const CacheManagementPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  
  const { data: cacheStatsResponse, isLoading, refetch } = useGetCacheStats();
  const { mutate: flushCache, isLoading: isFlushing } = useFlushCache();

  // The actual data is usually inside `.data` because of sendResponse wrapper
  const stats = cacheStatsResponse?.data || {};

  const handleFlushCache = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will immediately invalidate all application cache across the platform. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, flush it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        flushCache();
      }
    });
  };

  const bytesToMB = (bytes) => {
    if (!bytes) return "0 MB";
    return (parseInt(bytes) / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <React.Fragment>
      <Head title="Cache Management" />
      <Content>
        <Card>
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${
                sm ? "content-active" : ""
              }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} />
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="md">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h2" className="fw-normal">
                      Cache Management
                    </BlockTitle>
                    <BlockDes>
                      <p>
                        View Redis cache performance statistics and manage cache invalidation.
                      </p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">CACHE STATISTICS</h6>
                      <Button color="light" size="sm" onClick={() => refetch()} disabled={isLoading}>
                        <Icon name="reload" />
                      </Button>
                    </BlockBetween>
                  </div>

                  {isLoading ? (
                    <div className="p-3 text-center">
                      <Spinner size="sm" /> <span>Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Redis Version</span>
                          <span className="data-value">{stats?.server?.redis_version || "N/A"}</span>
                        </div>
                      </div>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Uptime (days)</span>
                          <span className="data-value">{stats?.server?.uptime_in_days || "0"} days</span>
                        </div>
                      </div>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Connected Clients</span>
                          <span className="data-value">{stats?.clients?.connected_clients || "0"}</span>
                        </div>
                      </div>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Memory Used</span>
                          <span className="data-value">{bytesToMB(stats?.memory?.used_memory)}</span>
                        </div>
                      </div>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Keyspace Hits / Misses</span>
                          <span className="data-value">
                            {stats?.stats?.keyspace_hits || "0"} / {stats?.stats?.keyspace_misses || "0"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5">
                  <h6 className="title mb-3">Danger Zone</h6>
                  <Card className="card-bordered">
                    <div className="card-inner">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="title">Flush All Cache</h6>
                          <p className="text-soft mb-0">
                            Force clear all cached data. This will momentarily increase database load as cache rebuilds.
                          </p>
                        </div>
                        <Button color="danger" onClick={handleFlushCache} disabled={isFlushing}>
                          {isFlushing ? <Spinner size="sm" /> : <><Icon name="trash" /> <span>Flush Cache</span></>}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </Block>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default CacheManagementPage;
