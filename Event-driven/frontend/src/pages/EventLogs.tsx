import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import { Refresh, Assessment } from '@mui/icons-material';
import { logApi } from '../services/api';

interface Event {
  event_id: number;
  timestamp: string;
  type: string;
  user_id?: number;
  product_id?: number;
  order_id?: number;
  data: any;
  aggregate_id?: string;
  aggregate_type?: string;
}

interface EventStats {
  totalEvents: number;
  eventTypeStats: Array<{ type: string; count: string }>;
  recentEvents: Event[];
}

const EventLogs: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'events' | 'stats'>('events');

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'events') {
        const response = await logApi.getAllEvents();
        // Ensure we have an array
        const eventsData = Array.isArray(response.data.events) ? response.data.events : 
                          Array.isArray(response.data) ? response.data : [];
        setEvents(eventsData);
      } else {
        const response = await logApi.getEventStats();
        setStats(response.data || null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (view === 'events') {
        setEvents([]); // Set empty array on error
      } else {
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (type: string) => {
    if (type.includes('placed')) return 'primary';
    if (type.includes('paid')) return 'success';
    if (type.includes('cancelled')) return 'error';
    return 'default';
  };

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" className="page-title">
          📊 Event Logs
        </Typography>
        <Box>
          <Button
            variant={view === 'events' ? 'contained' : 'outlined'}
            onClick={() => setView('events')}
            sx={{ mr: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            📝 Events
          </Button>
          <Button
            variant={view === 'stats' ? 'contained' : 'outlined'}
            startIcon={<Assessment />}
            onClick={() => setView('stats')}
            sx={{ mr: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            📈 Statistics
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            🔄 Refresh
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography className="loading-text">Loading data...</Typography>
        </Box>
      ) : view === 'events' ? (
        <>
          {events.length === 0 ? (
            <Alert severity="info">No events found.</Alert>
          ) : (
            <Grid container spacing={2}>
              {events.map((event) => (
                <Grid item xs={12} key={event.event_id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">
                          Event #{event.event_id}
                        </Typography>
                        <Chip
                          label={event.type}
                          color={getEventTypeColor(event.type) as any}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(event.timestamp)}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {event.user_id && (
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>User ID:</strong> {event.user_id}
                            </Typography>
                          </Grid>
                        )}
                        {event.product_id && (
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Product ID:</strong> {event.product_id}
                            </Typography>
                          </Grid>
                        )}
                        {event.order_id && (
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Order ID:</strong> {event.order_id}
                            </Typography>
                          </Grid>
                        )}
                        {event.aggregate_id && (
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Aggregate:</strong> {event.aggregate_id}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                      
                      {event.data && (
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Event Data:</strong>
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              backgroundColor: '#f5f5f5',
                              padding: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              mt: 1,
                            }}
                          >
                            {JSON.stringify(event.data, null, 2)}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <>
          {stats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card className="stats-card">
                  <CardContent>
                    <Typography variant="h4" color="white" gutterBottom>
                      {stats.totalEvents}
                    </Typography>
                    <Typography variant="h6" color="white">
                      Total Events
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Events by Type
                    </Typography>
                    {stats.eventTypeStats.map((stat, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                        <Typography>{stat.type}</Typography>
                        <Chip label={stat.count} size="small" />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Events
                    </Typography>
                    {stats.recentEvents.map((event) => (
                      <Box key={event.event_id} mb={1} p={1} bgcolor="#f9f9f9" borderRadius={1}>
                        <Typography variant="body2">
                          <strong>{event.type}</strong> - {formatDate(event.timestamp)}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default EventLogs;
