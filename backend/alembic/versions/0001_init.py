from alembic import op
import sqlalchemy as sa


revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "trips",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("platform_trip_id", sa.String(), nullable=False),
        sa.Column("worker_id", sa.String(), nullable=False),
        sa.Column("zone", sa.String(), nullable=False),
        sa.Column("status", sa.Enum("pending", "in_progress", "completed", "disrupted", name="tripstatus"), index=True),
        sa.Column("accepted_at", sa.DateTime(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("expected_earnings", sa.Float(), nullable=False, server_default="0"),
        sa.Column("disruption_reason", sa.String(), nullable=True),
    )

    op.create_table(
        "trigger_events",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("trigger_type", sa.Enum("environmental", "civic", name="triggertype"), index=True),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("zone", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("severity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "claims",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("trip_id", sa.Integer, sa.ForeignKey("trips.id"), nullable=False),
        sa.Column("worker_id", sa.String(), nullable=False),
        sa.Column("trigger_event_id", sa.Integer, sa.ForeignKey("trigger_events.id"), nullable=False),
        sa.Column("status", sa.Enum("generated", "approved", "paid", name="claimstatus"), index=True),
        sa.Column("amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("paid_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("claims")
    op.drop_table("trigger_events")
    op.drop_table("trips")

